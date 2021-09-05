import Paper from '@material-ui/core/Paper'
import GetApp from '@material-ui/icons/GetApp'
import Button from '@material-ui/core/Button'
import clsx from 'clsx'
import {
  createStyles, lighten, makeStyles, Theme,
} from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TablePagination from '@material-ui/core/TablePagination'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Checkbox from '@material-ui/core/Checkbox'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import DeleteIcon from '@material-ui/icons/Delete'
import FilterListIcon from '@material-ui/icons/FilterList'
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

function renderResource(resource: Resource, downloadResource: (dummy: void) => void, classes: ReturnType<typeof useStyles>) {
  let buttonState: ButtonState
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
    case LocalFileStateT.LOAD_ERROR: // TODO: handle error
      buttonState = ButtonState.NORMAL
      break
  }
  const onClick = () => {
    if (buttonState === ButtonState.NORMAL) {
      downloadResource()
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
        {buttonState !== ButtonState.LOADING ? 'Download' : ''}
      </Button>
      {buttonState === ButtonState.LOADING && <CircularProgress size={24} className={classes.buttonProgress} />}
    </div>
  )
}

export type Data = {
  id: number
  name: string
  url: string
  resourceSrc: string | undefined
  origin: Resource
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

export type Order = 'asc' | 'desc'

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]: number | string | any }, b: { [key in Key]: number | string | any }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number])
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })
  return stabilizedThis.map((el) => el[0])
}

interface HeadCell {
  disablePadding: boolean
  id: keyof Data
  label: string
  numeric: boolean
}

const headCells: HeadCell[] = [
  {
    id: 'id', numeric: false, disablePadding: true, label: 'ID',
  },
  {
    id: 'name', numeric: true, disablePadding: false, label: 'Name',
  },
  {
    id: 'url', numeric: false, disablePadding: false, label: 'URL',
  },
  {
    id: 'resourceSrc', numeric: false, disablePadding: false, label: 'Resource',
  },
  {
    id: 'origin', numeric: false, disablePadding: false, label: 'Protein (g)',
  },
]

interface EnhancedTableProps {
  classes: ReturnType<typeof useStyles2>
  numSelected: number
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void
  order: Order
  orderBy: string
  rowCount: number
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const {
    classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort,
  } = props
  const createSortHandler = (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property)
  }

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all desserts' }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            style={{ width: 10 }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

const useToolbarStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
    },
    highlight:
      theme.palette.type === 'light'
        ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
        : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
    title: {
      flex: '1 1 100%',
    },
  }))

interface EnhancedTableToolbarProps {
  numSelected: number
}

const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) => {
  const classes = useToolbarStyles()
  const { numSelected } = props

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
          {numSelected}
          {' '}
          selected
        </Typography>
      ) : (
        <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
          Nutrition
        </Typography>
      )}
      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton aria-label="delete">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton aria-label="filter list">
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  )
}

const useStyles2 = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    paper: {
      width: '100%',
      marginBottom: theme.spacing(2),
    },
    table: {
      minWidth: 750,
    },
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1,
    },
  }))
import * as Slice from './resourcesSlice'
import { AnyAction, Dispatch } from '@reduxjs/toolkit'

export default function EnhancedTable(params:{inner:[Slice.State, Dispatch<AnyAction>], resources:Resource[], downloadResourceByIndex: (idx: number) => void}) {
  const { inner, resources, downloadResourceByIndex } = params
  const [state, dispatch] = inner

  const {
    order, orderBy, selected, page, dense, rowsPerPage,
  } = state
  const {
    setOrder, setOrderBy, setSelected, setPage, setDense, setRowsPerPage,
  } = Slice.resourceSlice.actions

  const classes = useStyles2()
  const classes2 = useStyles()
  // const [order, setOrder] = React.useState<Order>('asc')
  // const [orderBy, setOrderBy] = React.useState<keyof Data>('name')
  // const [selected, setSelected] = React.useState<string[]>([])
  // const [page, setPage] = React.useState(0)
  // const [dense, setDense] = React.useState(false)
  // const [rowsPerPage, setRowsPerPage] = React.useState(5)

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof Data) => {
    const isAsc = orderBy === property && order === 'asc'
    dispatch(setOrder(isAsc ? 'desc' : 'asc'))
    dispatch(setOrderBy(property))
  }

  const rows = resources.map((resource, i): Data => {
    let resourceSrc: string | undefined
    switch (resource.fileState[0]) {
      case LocalFileStateT.EXIST:
        const [, absolutePath] = resource.fileState
        resourceSrc = absolutePath
        break
      default:
        resourceSrc = undefined
        break
    }
    return {
      id: i,
      name: i.toString(),
      url: resource.url,
      resourceSrc: resourceSrc,
      origin: resource,
    }
  })

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.name)
      dispatch(setSelected(newSelecteds))
      return
    }
    dispatch(setSelected([]))
  }

  const handleClick = (event: React.MouseEvent<unknown>, name: string) => {
    const selectedIndex = selected.indexOf(name)
    let newSelected: string[] = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      )
    }

    dispatch(setSelected(newSelected))
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    dispatch(setPage(newPage))
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setRowsPerPage(parseInt(event.target.value, 10)))
    dispatch(setPage(0))
  }

  const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setDense(event.target.checked))
  }

  const isSelected = (name: string) => selected.indexOf(name) !== -1

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage)

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar numSelected={selected.length} />
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row:Data, index) => {
                  const isItemSelected = isSelected(row.name)
                  const labelId = `enhanced-table-checkbox-${index}`

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.name)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.name}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </TableCell>
                      <TableCell component="th" id={labelId} scope="row" padding="none">
                        {row.name}
                      </TableCell>
                      <TableCell align="right" style={{ width: 40 }}>{row.id}</TableCell>
                      <TableCell align="right" style={{ width: 40 }}>{row.url.substr(0, 40)}</TableCell>
                      <TableCell align="right" style={{ width: 40 }}>
                        {row.resourceSrc && (<img style={{ height: (dense ? 33 : 53) }} src={row.resourceSrc} alt="resource" />)}
                      </TableCell>
                      <TableCell align="right" style={{ width: 40 }}>
                        {renderResource(row.origin, () => downloadResourceByIndex(row.id), classes2)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows, width: 10 }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Dense padding"
      />
    </div>
  )
}
