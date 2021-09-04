import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import GetApp from '@material-ui/icons/GetApp'
import Button from '@material-ui/core/Button'
import { makeStyles, Theme, withStyles } from '@material-ui/core/styles'
import {
  DataGrid,
  GridColDef,
  GridApi,
  GridCellValue,
  GridCellParams,
  MuiEvent,
  GridRenderCellParams,
  GridColumns,
} from '@mui/x-data-grid'
import * as React from 'react'
import {
  CircularProgress,
} from '@material-ui/core'
import { blue } from '@material-ui/core/colors'
import { LocalFileStateT, Resource } from '../../../shared/state'
import { useAppSelector, useAppDispatch } from '../../app/hooks'
import { downloadResourceByIndex } from './backuperSlice'

const useStyles = makeStyles((theme) => ({
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  appBarSpacer: theme.mixins.toolbar,
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    elevation: 3,
  },
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  buttonSuccess: {
    backgroundColor: blue[500],
    '&:hover': {
      backgroundColor: blue[700],
    },
  },
  fabProgress: {
    color: blue[500],
    position: 'absolute',
    top: -6,
    left: -6,
    zIndex: 1,
  },
  buttonProgress: {
    color: blue[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
}))

enum ButtonState {
  NORMAL = 'NORMAL',
  LOADING = 'LOADING',
  DISABLE = 'DISABLE',
}

export function Resources(params:{resources:Resource[], dispatch: ReturnType<typeof useAppDispatch>}) {
  const { resources, dispatch } = params

  const classes = useStyles()

  const columns: GridColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'Url', headerName: 'URL', width: 130 },
    {
      field: 'imgUri',
      headerName: 'Image',
      width: 130,
      renderCell: (params: GridRenderCellParams) => {
        const imgUri = params.value as string
        return (
          <>
            { imgUri && <img src={imgUri} alt="" /> }
          </>
        )
      }
    },
    {
      field: 'Download',
      headerName: 'Delete',
      sortable: false,
      width: 130,
      renderCell: (params: GridRenderCellParams) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, prefer-destructuring
        const resource: Resource = params.row.resource
        let buttonState:ButtonState
        switch (resource.fileState[0]) {
          case LocalFileStateT.LOADING:
            buttonState = ButtonState.LOADING
            break
          case LocalFileStateT.NOT_EXIST:
            buttonState = ButtonState.NORMAL
            break
          case LocalFileStateT.EXIST:
            buttonState = ButtonState.NORMAL // TODO: warn that the file has already been downloaded
            break
          case LocalFileStateT.LOAD_ERROR:
            // const [, errMsg] = resource.fileState // TODO: handle error
            buttonState = ButtonState.NORMAL
            break
        }
        const onClick = () => {
          if (buttonState === ButtonState.NORMAL) {
            dispatch(downloadResourceByIndex(params.row.id))
          }
        }
        return (
          <div className={classes.wrapper}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<GetApp />}
              disabled={buttonState !== ButtonState.NORMAL}
              onClick={onClick}
            >
              { buttonState !== ButtonState.LOADING ? 'Download' : ''}
            </Button>
            {buttonState === ButtonState.LOADING && <CircularProgress size={24} className={classes.buttonProgress} />}
          </div>
        )
      }
    },
  ]
  const rows = resources.map((resource, i) => {
    let imgUri:string
    switch (resource.fileState[0]) {
      case LocalFileStateT.EXIST:
        const [, absolutePath] = resource.fileState
        imgUri = absolutePath
        break
      default:
        imgUri = ''
        break
    }
    return {
      id: i,
      url: resource.url,
      imgUri: imgUri,
      resource: resource,
    }
  })

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Container maxWidth="lg" className={classes.container}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={10}
              columnBuffer={8}
              autoHeight
            />
          </Paper>
        </Grid>
      </Container>
    </main>
  )
}

export default Resources
