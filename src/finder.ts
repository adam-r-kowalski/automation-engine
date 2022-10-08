import { Color, column, container, text, UI } from "./ui"
import { CrossAxisAlignment } from "./ui/alignment"
import { fuzzyFind } from "./fuzzy_find"
import { KeyDown } from "./event"

export interface Model {
    readonly search: string
    readonly options: Readonly<string[]>
    readonly selectedIndex: number
}

const shownOptions = (model: Model): string[] =>
    model.options
        .filter((option) =>
            fuzzyFind({ haystack: option, needle: model.search })
        )
        .slice(0, 10)

export interface Theme {
    background: Color
    searchBackground: Color
    searchText: Color
    selected: Color
    unselected: Color
}

interface ViewProperties {
    model: Model
    theme: Theme
    onClick: (option: string) => void
}

export const view = (properties: ViewProperties): UI => {
    const { model, theme, onClick } = properties
    const { search, selectedIndex } = model
    return column({ crossAxisAlignment: CrossAxisAlignment.CENTER }, [
        container({ height: 10 }),
        container(
            { color: theme.background, padding: 4 },
            column([
                container(
                    { color: theme.searchBackground, width: 300, padding: 4 },
                    text(
                        { color: theme.searchText, size: 24 },
                        search.length ? search : "Search ..."
                    )
                ),
                container({ width: 10, height: 10 }),
                ...shownOptions(model).map((option, i) => {
                    const color =
                        i == selectedIndex ? theme.selected : theme.unselected
                    return container(
                        {
                            width: 300,
                            padding: 4,
                            onClick: () => onClick(option),
                        },
                        text({ size: 18, color }, option)
                    )
                }),
            ])
        ),
    ])
}

interface UpdateProperties<AppEvent> {
    model: Model
    event: KeyDown
    onSelect: (option: string) => AppEvent
    onClose: AppEvent
}

interface UpdateResult<AppEvent> {
    model: Model
    event?: AppEvent
}

const decrementIndex = <AppEvent>(model: Model): UpdateResult<AppEvent> => {
    const selectedIndex = Math.max(0, model.selectedIndex - 1)
    return { model: { ...model, selectedIndex } }
}

const incrementIndex = <AppEvent>(model: Model): UpdateResult<AppEvent> => {
    const options = shownOptions(model)
    const selectedIndex = Math.min(
        model.selectedIndex + 1,
        options.length - 1,
        9
    )
    return { model: { ...model, selectedIndex } }
}

const addToSearch = <AppEvent>(
    model: Model,
    key: string
): UpdateResult<AppEvent> => {
    const search = model.search + key
    return { model: { ...model, search } }
}

export const update = <AppEvent>(
    properties: UpdateProperties<AppEvent>
): UpdateResult<AppEvent> => {
    const { model, event, onSelect, onClose } = properties
    switch (event.key) {
        case "Backspace": {
            const search = model.search.slice(0, -1)
            return { model: { ...model, search } }
        }
        case "Shift":
        case "Alt":
        case "Control":
        case "Meta":
        case "Tab":
            return { model }
        case "Enter": {
            const options = shownOptions(model)
            return options.length > 0
                ? {
                      model,
                      event: onSelect(options[model.selectedIndex]),
                  }
                : { model, event: onClose }
        }
        case "Escape":
            return { model, event: onClose }
        case "ArrowUp":
        case "<c-k>":
            return decrementIndex(model)
        case "ArrowDown":
        case "<c-j>":
            return incrementIndex(model)
        default:
            return addToSearch(model, event.key)
    }
}