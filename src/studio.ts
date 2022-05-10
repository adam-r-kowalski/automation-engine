import { ECS } from './ecs'
import { updateLocalTransform } from './systems'
import { Translate, Rotate, Scale } from './components'

export const initECS = (): ECS => {
  const ecs = new ECS()
  ecs.onAnyChange([Translate, Rotate, Scale], updateLocalTransform)
  return ecs
}

export * as renderer from './renderer'
export { ECS, Entity } from './ecs'
export {
  orthographicProjection,
  perspectiveProjection,
  ActiveCamera,
  Geometry,
  planeGeometry,
  Translate,
  Rotate,
  Scale,
  Fill,
  Root,
  Children,
  LookAt,
} from './components'
export { Mat4x4, Vec3 } from './linear_algebra'
export { physicalEntity, orthographicCamera, perspectiveCamera } from './prefabs'
export * as prefabs from './prefabs'

