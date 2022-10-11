import { container, Pointer, row, text } from "../src/ui"
import { mockDocument, mockWindow } from "../src/ui/mock"
import { Dispatch, run } from "../src/run"
import { makeEffects } from "./mock_effects"

const mockRequestAnimationFrame = (callback: () => void) => callback()

interface Model {
    a: number
    b: number
}

const model: Model = { a: 0, b: 0 }

enum AppEvent {
    A,
    B,
}

test("if update does not modify model then view gets called once", () => {
    const effects = makeEffects(mockDocument())
    let viewCallCount = 0
    const view = (_: Model) => {
        ++viewCallCount
        return text("")
    }
    const update = (model: Model, _: AppEvent, _1: Dispatch<AppEvent>) => {
        return model
    }
    const dispatch = run({
        model,
        view,
        update,
        window: mockWindow<AppEvent>(),
        document: mockDocument(),
        requestAnimationFrame: mockRequestAnimationFrame,
        currentTime: effects.currentTime,
        pointerDown: () => {},
    })
    dispatch(AppEvent.A)
    expect(viewCallCount).toEqual(1)
})

test("if update modifies model view gets called again", () => {
    const effects = makeEffects(mockDocument())
    let viewCallCount = 0
    const view = (_: Model) => {
        ++viewCallCount
        return text("")
    }
    const update = (model: Model, event: AppEvent, _: Dispatch<AppEvent>) => {
        switch (event) {
            case AppEvent.A:
                return { a: model.a + 1, b: model.b }
            case AppEvent.B:
                return { a: model.a, b: model.b + 1 }
        }
    }

    const dispatch = run({
        model,
        view,
        update,
        window: mockWindow<AppEvent>(),
        document: mockDocument(),
        requestAnimationFrame: mockRequestAnimationFrame,
        currentTime: effects.currentTime,
        pointerDown: () => {},
    })
    dispatch(AppEvent.A)
    expect(viewCallCount).toEqual(2)
})

test("update gets passed dispatch and can schedule events", () => {
    const effects = makeEffects(mockDocument())
    const update = (
        model: Model,
        event: AppEvent,
        dispatch: Dispatch<AppEvent>
    ) => {
        switch (event) {
            case AppEvent.A:
                dispatch(AppEvent.B)
                dispatch(AppEvent.B)
                return model
            case AppEvent.B:
                return model
        }
    }
    const window = mockWindow<AppEvent>()
    const view = (_: Model, _1: Dispatch<AppEvent>) => text("")
    const dispatch = run({
        model,
        view,
        update,
        window,
        document: mockDocument(),
        requestAnimationFrame: mockRequestAnimationFrame,
        currentTime: effects.currentTime,
        pointerDown: () => {},
    })
    expect(window.events).toEqual([])
    dispatch(AppEvent.A)
    expect(window.events).toEqual([AppEvent.A, AppEvent.B, AppEvent.B])
})

test("pointer down events can lead to on click handlers firing", () => {
    const effects = makeEffects(mockDocument())
    const view = (_: Model, dispatch: Dispatch<AppEvent>) =>
        row([
            container({
                onClick: () => dispatch(AppEvent.A),
                width: 50,
                height: 50,
            }),
            container({
                onClick: () => dispatch(AppEvent.B),
                width: 50,
                height: 50,
            }),
        ])
    const update = (model: Model, _: AppEvent, _1: Dispatch<AppEvent>) => {
        return model
    }
    const document = mockDocument()
    let pointers: Pointer[] = []
    const window = mockWindow<AppEvent>()
    run({
        model,
        view,
        update,
        window,
        document,
        requestAnimationFrame: mockRequestAnimationFrame,
        currentTime: effects.currentTime,
        pointerDown: (_, pointer) => {
            pointers.push(pointer)
        },
    })
    document.fireEvent("pointerdown", {
        clientX: 0,
        clientY: 0,
        pointerId: 0,
    })
    document.fireEvent("pointerdown", {
        clientX: 51,
        clientY: 0,
        pointerId: 0,
    })
    document.fireEvent("pointerdown", {
        clientX: 200,
        clientY: 200,
        pointerId: 0,
    })
    expect(window.events).toEqual([AppEvent.A, AppEvent.B])
    expect(pointers).toEqual([
        {
            id: 0,
            position: { x: 0, y: 0 },
        },
        {
            id: 0,
            position: { x: 51, y: 0 },
        },
        {
            id: 0,
            position: { x: 200, y: 200 },
        },
    ])
})

test("resize events trigger a rerender", () => {
    const effects = makeEffects(mockDocument())
    let viewCallCount = 0
    const view = (_: Model) => {
        ++viewCallCount
        return text("")
    }
    const update = (_: Model, _1: AppEvent, _2: Dispatch<AppEvent>) => model
    const window = mockWindow<AppEvent>()
    run({
        model,
        view,
        update,
        window,
        document: mockDocument(),
        requestAnimationFrame: mockRequestAnimationFrame,
        currentTime: effects.currentTime,
        pointerDown: () => {},
    })
    expect(viewCallCount).toEqual(1)
    window.fireEvent("resize")
    expect(viewCallCount).toEqual(2)
})
