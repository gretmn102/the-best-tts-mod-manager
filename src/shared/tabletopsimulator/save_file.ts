type Quaternion = any
type PhysicMaterialCombine = any
type DiceType = any
type TileType = any
type HashSet = any
type ClockState = any
type Menus = any
type JointLimits = any
type JointMotor = any
type JointSpring = any

export interface Vector3 {
  x: number,
  y: number,
  z: number
}

export interface SaveState {
  SaveName: string
  GameMode: string
  Gravity: number
  PlayArea: number
  Date: string
  Table: string
  TableURL: string
  Sky: string
  SkyURL: string
  Note: string
  Rules: string
  XmlUI: string
  CustomUIAssets: CustomAssetState[]
  LuaScript: string
  LuaScriptState: string
  Grid: GridState
  Lighting: LightingState
  Hands: HandsState
  Turns: TurnsState
  VectorLines: VectorLineState[]
  ObjectStates: ObjectState[]
  SnapPoints: SnapPointState[]
  DecalPallet: CustomDecalState[]
  Decals: DecalState[]
  TabStates: { [key: number]: TabState }
  CameraStates: CameraState[]
  VersionNumber: string
}
export interface CustomPDFState {
  PDFUrl: string,
  DFPassword: string,
  PDFPage: number,
  PDFPageOffset: number
}
export interface ObjectState {
  Name: string
  Transform: TransformState
  Nickname: string
  Description: string
  ColorDiffuse: ColourState
  Locked: boolean
  Grid: boolean
  Snap: boolean
  Autoraise: boolean
  Sticky: boolean
  Tooltip: boolean
  GridProjection: boolean
  HideWhenFaceDown: boolean | null
  Hands: boolean | null
  AltSound: boolean | null
  MaterialIndex: number | null
  MeshIndex: number | null
  Layer: number | null
  Number: number | null
  CardID: number | null
  SidewaysCard: boolean | null
  RPGmode: boolean | null
  RPGdead: boolean | null
  FogColor: string
  FogHidePointers: boolean | null
  FogReverseHiding: boolean | null
  FogSeethrough: boolean | null
  DeckIDs: number[]
  CustomDeck: {
    [key: number]: CustomDeckState
  }
  CustomMesh: CustomMeshState
  CustomImage: CustomImageState
  CustomAssetbundle: CustomAssetbundleState
  CustomPDF: CustomPDFState
  FogOfWar: FogOfWarSaveState
  FogOfWarRevealer: FogOfWarRevealerSaveState
  Clock: ClockSaveState
  Counter: CounterState
  Tablet: TabletState
  Mp3Player: Mp3PlayerState
  Calculator: CalculatorState
  Text: TextState
  XmlUI: string
  CustomUIAssets: CustomAssetState[]
  LuaScript: string
  LuaScriptState: string
  ContainedObjects: ObjectState[]
  PhysicsMaterial: PhysicsMaterialState
  Rigidbody: RigidbodyState
  JointFixed: JointFixedState
  JointHinge: JointHingeState
  JointSpring: JointSpringState
  GUID: string
  AttachedSnapPoints: SnapPointState[]
  AttachedVectorLines: VectorLineState[]
  AttachedDecals: DecalState[]
  States: { [key: number]: ObjectState }
  RotationValues: RotationValueState[]
}

export interface GridState {
  Type: GridType
  Lines: boolean
  Color: ColourState
  Opacity: number
  ThickLines: boolean
  Snapping: boolean
  Offset: boolean
  BothSnapping: boolean
  xSize: number
  ySize: number
  PosOffset: VectorState
}

export enum GridType {
  Box,
  HexHorizontal,
  HexVertical
}

export interface LightingState {
  LightIntensity: number
  LightColor: ColourState
  AmbientIntensity: number
  AmbientType: AmbientType
  AmbientSkyColor: ColourState
  AmbientEquatorColor: ColourState
  AmbientGroundColor: ColourState
  ReflectionIntensity: number
  LutIndex: number
  LutContribution: number
  LutURL: string
}

export enum AmbientType {
  Background,
  Gradient
}

export interface HandsState {
  Enable: boolean
  DisableUnused: boolean
  Hiding: HidingType
  HandTransforms: HandTransformState[]
}

export enum HidingType {
  Default,
  Reverse,
  Disable
}

export interface HandTransformState {
  Color: string
  Transform: TransformState
}

export interface TurnsState {
  Enable: boolean
  Type: TurnType
  TurnOrder: string[]
  Reverse: boolean
  SkipEmpty: boolean
  DisableInteractions: boolean
  PassTurns: boolean
  TurnColor: string
}

export enum TurnType {
  Auto,
  Custom
}

export interface TextState {
  Text: string
  colorstate: ColourState
  fontSize: number
}

export interface TabState {
  title: string
  body: string
  color: string
  visibleColor: ColourState
  id: number
}

export interface SnapPointState {
  Position: VectorState
  Rotation: VectorState
}

export interface DecalState {
  Transform: TransformState
  CustomDecal: CustomDecalState
}

export interface CustomDecalState {
  Name: string
  ImageURL: string
  Size: number
}

export interface RotationValueState {
  Value: any
  Rotation: VectorState
}

export interface CustomAssetState {
  Name: string
  URL: string
}

export interface OrientationState {
  position: Vector3
  rotation: Quaternion
}

export interface TransformState {
  posX: number
  posY: number
  posZ: number
  rotX: number
  rotY: number
  rotZ: number
  scaleX: number
  scaleY: number
  scaleZ: number
}

export interface ColourState {
  r: number
  g: number
  b: number
}

export interface VectorState {
  x: number
  y: number
  z: number
}

export interface RigidbodyState {
  Mass: number
  Drag: number
  AngularDrag: number
  UseGravity: boolean
}

export interface PhysicsMaterialState {
  StaticFriction: number
  DynamicFriction: number
  Bounciness: number
  FrictionCombine: PhysicMaterialCombine
  BounceCombine: PhysicMaterialCombine
}

export interface CustomDeckState {
  FaceURL: string
  BackURL: string
  NumWidth: number | null
  NumHeight: number | null
  BackIsHidden: boolean
  UniqueBack: boolean
}

export interface CustomImageState {
  ImageURL: string
  ImageSecondaryURL: string
  WidthScale: number
  CustomDice: CustomDiceState
  CustomToken: CustomTokenState
  CustomJigsawPuzzle: CustomJigsawPuzzleState
  CustomTile: CustomTileState
}

export interface CustomAssetbundleState {
  AssetbundleURL: string
  AssetbundleSecondaryURL: string
  MaterialIndex: number
  TypeIndex: number
  LoopingEffectIndex: number
}

export interface CustomDiceState {
  Type: DiceType
}

export interface CustomTokenState {
  Thickness: number
  MergeDistancePixels: number
  Stackable: boolean
}

export interface CustomTileState {
  Type: TileType
  Thickness: number
  Stackable: boolean
  Stretch: boolean
}

export interface CustomJigsawPuzzleState {
  NumPuzzlePieces: number
  ImageOnBoard: boolean
}

export interface CustomMeshState {
  MeshURL: string
  DiffuseURL: string
  NormalURL: string
  ColliderURL: string
  Convex: boolean
  MaterialIndex: number
  TypeIndex: number
  CustomShader: CustomShaderState
  CastShadows: boolean
}

export interface CustomShaderState {
  SpecularColor: ColourState
  SpecularIntensity: number
  SpecularSharpness: number
  FresnelStrength: number
}

export interface FogOfWarSaveState {
  HideGmPointer: boolean
  HideObjects: boolean
  Height: number
  RevealedLocations: { [key: string]: HashSet }
}

export interface FogOfWarRevealerSaveState {
  Active: boolean
  Range: number
  Color: string
}

export interface TabletState {
  PageURL: string
}

export interface ClockSaveState {
  ClockState: ClockState
  SecondsPassed: number
  Paused: boolean
}

export interface CounterState {
  value: number
}

export interface Mp3PlayerState {
  songTitle: string
  genre: string
  volume: number
  isPlaying: boolean
  loopOne: boolean
  menuTitle: string
  menu: Menus
}

export interface CalculatorState {
  value: string
  memory: number
}

export interface VectorLineState {
  points3: VectorState[]
  color: ColourState
  thickness: number
  rotation: VectorState
  loop: boolean | null
  square: boolean | null
}

export interface CameraState {
  Position: VectorState
  Rotation: VectorState
  Distance: number
  Zoomed: boolean
}

export interface JointState {
  ConnectedBodyGUID: string
  EnableCollision: boolean
  Axis: VectorState
  Anchor: VectorState
  ConnectedAnchor: VectorState
  BreakForce: number
  BreakTorgue: number
}

export type JointFixedState = JointState

export interface JointHingeState extends JointState {
  UseLimits: boolean
  Limits: JointLimits
  UseMotor: boolean
  Motor: JointMotor
  UseSpring: boolean
  Spring: JointSpring
}

export interface JointSpringState extends JointState {
  Damper: number
  MaxDistance: number
  MinDistance: number
  Spring: number
}
