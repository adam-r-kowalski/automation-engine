import { pointerDown } from "./new_ui/pointer_down"
import { render } from "./new_ui/render"
import { WebGL2Renderer, webGL2Renderer } from "./new_ui/webgl2"
import { Pointer, UI } from "./new_ui"

export const transformPointer = (p: PointerEvent): Pointer => ({
    x: p.clientX,
    y: p.clientY,
    id: p.pointerId,
})

export type Dispatch<AppEvent> = (event: AppEvent) => void

type View<State, AppEvent> = (state: State) => UI<AppEvent>

interface Milliseconds {
    milliseconds: number
}

interface Scheduled<AppEvent> {
    after: Milliseconds
    event: AppEvent
}

export interface UpdateResult<State, AppEvent> {
    state: State
    render?: boolean
    schedule?: Scheduled<AppEvent>[]
    dispatch?: AppEvent[]
}

type Update<State, AppEvent> = (state: State, event: AppEvent) => UpdateResult<State, AppEvent>

export const run = <State, AppEvent>(state: State, view: View<State, AppEvent>, update: Update<State, AppEvent>): Dispatch<AppEvent> => {
    let renderer = webGL2Renderer<AppEvent>({
        width: window.innerWidth,
        height: window.innerHeight,
        window,
        document,
    })
    let renderQueued = false
    const scheduleRender = () => {
        if (!renderQueued) {
            renderQueued = true
            requestAnimationFrame(() => {
                renderer = render(renderer, view(state))
                renderQueued = false
            })
        }
    }
    const dispatch = (event: AppEvent) => {
        const { state: newState, render, schedule, dispatch: dispatchEvents } = update(state, event)
        state = newState
        if (render) scheduleRender()
        for (const { after, event } of schedule ?? []) {
            const { milliseconds } = after
            setTimeout(() => dispatch(event), milliseconds)
        }
        for (const event of dispatchEvents ?? []) dispatch(event)
    }
    renderer.dispatch = dispatch
    document.body.appendChild(renderer.canvas as HTMLCanvasElement)
    document.addEventListener("pointerdown", p => {
        renderer = pointerDown<AppEvent, WebGL2Renderer<AppEvent>>(renderer, transformPointer(p))
    })
    window.addEventListener("resize", () => {
        renderer.size = { width: window.innerWidth, height: window.innerHeight }
        scheduleRender()
    })
    scheduleRender()
    return dispatch
}
