import { ref, type Ref } from "vue";

/**
 * Vue 3.0 Composition API-dependent class that reactively watches the width and/or height of the wrapped element Ref.
 * Perfect for RWD.
 */
export class SizeWatcher {

  // The min number of milliseconds that must pass before the watcher checks the size again.
  // A lower value will result in smoother updates, but worse performance.
  // Higher values will have laggy updates, but better performance.
  private static WATCH_FREQUENCY: number = 200

  width: Ref<number> = ref(0)
  height: Ref<number> = ref(0)

  // Used to track the currently-running timeout
  private timeoutId: number

  /**
   * @param element The element to reactively watch for width or height changes
   * @param watchWidth Whether or not to watch the width of the element
   * @param watchHeight Whether or not to watch the height of the element
   */
  constructor(
    readonly element: Ref<HTMLElement | null>,
    readonly watchWidth: boolean = false,
    readonly watchHeight: boolean = false
  ) {
    this.timeoutId = -1
  }

  /**
   * Updates the reactive width and/or height values with the element's current size
   */
  private updateSize() {
    if (this.watchWidth) this.updateWidth()
    if (this.watchHeight) this.updateHeight()
  }

  private updateWidth() {
    const element = this.element.value

    // As long as things are not null:
    if (!!element && !!this.computedStyle) {
      // Update the width (excluding padding):
      const widthWithPadding = element.clientWidth
      this.width.value = widthWithPadding -
        parseFloat(this.computedStyle.paddingLeft) -
        parseFloat(this.computedStyle.paddingRight)
    }
  }

  private updateHeight() {
    const element = this.element.value

    // As long as things are not null:
    if (!!element && !!this.computedStyle) {
      // Update the width (excluding padding):
      const heightWithPadding = element.clientHeight
      this.height.value = heightWithPadding -
        parseFloat(this.computedStyle.paddingTop) -
        parseFloat(this.computedStyle.paddingBottom)
    }
  }

  /**
   * Creates a new timeout to check for a size change.
   * It removes a current one if there is one already running. This keeps things efficient.
   * 
   * Why are timeouts used, and why are they aborted here?
   * This method is called from an event listener that may be triggered many times in a short period of time.
   * Using a timeout in this manner limits the amount of method calls that may happen at once.
   */
  private handleTimeout() {
    if (this.timeoutId !== -1) {
      clearTimeout(this.timeoutId)
    }
    this.timeoutId = setTimeout(
      () => this.updateSize(),
      SizeWatcher.WATCH_FREQUENCY
    )
  }

  /**
   * Called by the parent of this class to begin watching the elements size
   */
  start() {
    this.updateSize()
    window.addEventListener(
      "resize",
      () => this.handleTimeout()
    )
  }

  /**
   * Used to get the element's padding (which is excluded from its height)
   */
  private get computedStyle(): CSSStyleDeclaration | null {
    const element = this.element.value
    if (!element) return null
    return getComputedStyle(element)
  }
}