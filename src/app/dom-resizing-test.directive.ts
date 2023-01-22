import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

/**
 * Default offset
 */
const OFFSET_MARGIN: number = 12;

/**
 * Delay time in ms
 */
const DELAY_RENDERING: number = 200;

@Directive({
  selector: '[headerSizeChangeHandler]',
  standalone: true,
})
export class HeaderSizeChangeHandlerDirective
  implements AfterViewInit, OnChanges
{
  @Input() tooltipText: string;
  @Input() bannerEl: ElementRef;

  /**
   * Rendering delay on resize - for better performance
   */
  private renderingDelayTimeoutId;

  constructor(private el: ElementRef) {}

  /**
   * First time page open
   */
  ngAfterViewInit(): void {
    this.bannerEl && this.checkElementResizing();
  }

  /**
   * Banner element may take some time(like Trail banner)
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.bannerEl?.firstChange === false &&
      changes.bannerEl?.currentValue
    ) {
      this.checkElementResizing();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.bannerEl) {
      clearTimeout(this.renderingDelayTimeoutId);
      this.renderingDelayTimeoutId = setTimeout(
        () => this.checkElementResizing(),
        DELAY_RENDERING
      );
    }
  }

  /**
   * Calculate the distance between Element1(company name span) and Element2(banner) and reduce the size of the first element.
   */
  checkElementResizing(): void {
    const hostPosition = this.getElementPosition(this.el.nativeElement);
    const bannerPosition = this.getElementPosition(this.bannerEl.nativeElement);

    // Calculating the distance between bottom-right(see elements as rectangles) of element Host and bottom-left of banner element
    const distance1: number = Math.hypot(
      hostPosition.right - bannerPosition.left,
      hostPosition.bottom - bannerPosition.bottom
    );

    // Calculating the distance between bottom-left of element Host and bottom-left of banner element
    const distance2: number = Math.hypot(
      hostPosition.left - bannerPosition.left,
      hostPosition.bottom - bannerPosition.bottom
    );

    // Calculating the distance between bottom-rigth of element Host and bottom-rigth of banner element
    const distance3: number = Math.hypot(
      hostPosition.right - bannerPosition.right,
      hostPosition.bottom - bannerPosition.bottom
    );

    let hostNewWidth: string = '100%';

    // Ture if element title is under banner element
    if (distance3 < bannerPosition.width) {
      hostNewWidth = `${Math.round(
        hostPosition.width - distance1 - OFFSET_MARGIN
      )}px`;
    }
    // True if title element is truncated and now there is more space avaialble to render it
    else if (distance2 < this.el.nativeElement.scrollWidth) {
      hostNewWidth = `${Math.round(
        hostPosition.width + distance1 - OFFSET_MARGIN
      )}px`;
    }

    this.el.nativeElement.style.width = hostNewWidth;
  }

  /**
   * Returns a DOMRect object providing information about the size of an element and its position relative to the viewport.
   * @param element
   * @returns DOMRect - is the smallest rectangle which contains the entire element, including its padding and border-width
   */
  getElementPosition(element: Element): DOMRect {
    return element.getBoundingClientRect();
  }
}
