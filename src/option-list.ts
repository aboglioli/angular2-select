import {ReflectiveInjector} from '@angular/core';

import {Option} from './option';
import {Diacritics} from './diacritics';

export class OptionList {

    private _options: Array<Option>;
    private _selection: Array<Option>;
    private _filtered: Array<Option>;
    private _value: Array<string>;

    private _highlightedOption: Option = null;

    constructor(options: Array<any>) {
        // Array<{ value: string; label: string;>) {

        // Inject diacritics service.
        // let inj = ReflectiveInjector.resolveAndCreate([DiacriticsService]);
        // this.diacriticsService = inj.get(DiacriticsService);

        if (typeof options === 'undefined' || options === null) {
            options = [];
        }

        // Initialize array of option objects.
        this._options = options.map((option) => {
            let o: Option = new Option(option.value, option.label);
            if (option.disabled) {
                o.disable();
            }
            return o;
        });

        this.highlight();
    }

    /**************************************************************************
     * Options.
     *************************************************************************/

    get options(): Array<Option> {
        return this._options;
    }

    getOptionsByValue(value: string): Array<Option> {
        return this.options.filter((option) => {
            return option.value === value;
        });
    }

    /**************************************************************************
     * Value.
     *************************************************************************/

    get value(): Array<string> {
        return this.selection.map((selectedOption) => {
            return selectedOption.value;
        });
    }

    set value(v: Array<string>) {
        v = typeof v === 'undefined' || v === null ? [] : v;

        this.options.forEach((option) => {
            option.selected = v.indexOf(option.value) > -1;
        });
    }

    /**************************************************************************
     * Selection.
     *************************************************************************/

    get selection(): Array<Option> {
        return this.options.filter((option) => {
            return option.selected;
        });
    }

    select(option: Option, multiple: boolean) {
        if (!multiple) {
            this.clearSelection();
        }
        option.selected = true;
    }

    deselect(option: Option) {
        option.selected = false;
    }

    clearSelection() {
        this.options.forEach((option) => {
            option.selected = false;
        });
    }

    /**************************************************************************
     * Filter.
     *************************************************************************/

    get filtered(): Array<Option> {
        return this.options.filter((option) => {
            return option.shown;
        });
    }

    filter(term: string) {

        if (term.trim() === '') {
            this.resetFilter();
        }
        else {
            this.options.forEach((option) => {
                // let strip: any = this.diacriticsService.stripDiacritics;


                // let l: string = strip.call(null, option.label).toUpperCase();
                // let t: string = strip.call(null, term).toUpperCase();

                let l: string = Diacritics.strip(option.label).toUpperCase();
                let t: string = Diacritics.strip(term).toUpperCase();

                option.shown = l.indexOf(t) > -1;
            });
        }

        this.highlight();
    }

    resetFilter() {
        this.options.forEach((option) => {
            option.shown = true;
        });
    }

    /**************************************************************************
     * Highlight.
     *************************************************************************/

    get highlightedOption(): Option {
        return this._highlightedOption;
    }

    highlight() {
        let option: Option = this.hasShownSelected() ?
            this.getFirstShownSelected() : this.getFirstShown();

        if (option !== null) {
            this.highlightOption(option);
        }
    }

    highlightOption(option: Option) {
        this.clearHighlightedOption();
        option.highlighted = true;
        this._highlightedOption = option;
    }

    highlightNextOption() {
        let shownOptions = this.filtered;
        let index = this.getHighlightedIndexFromList(shownOptions);

        if (index > -1 && index < shownOptions.length - 1) {
            this.highlightOption(shownOptions[index + 1]);
        }
    }

    highlightPreviousOption() {
        let shownOptions = this.filtered;
        let index = this.getHighlightedIndexFromList(shownOptions);

        if (index > 0) {
            this.highlightOption(shownOptions[index - 1]);
        }
    }

    private clearHighlightedOption() {
        if (this.highlightedOption !== null) {
            this._highlightedOption.highlighted = false;
            this._highlightedOption = null;
        }
    }

    private getHighlightedIndexFromList(options: Array<Option>) {
        for (let i = 0; i < options.length; i++) {
            if (options[i].highlighted) {
                return i;
            }
        }
        return -1;
    }

    getHighlightedIndex() {
        return this.getHighlightedIndexFromList(this.filtered);
    }

    /**************************************************************************
     * Util.
     *************************************************************************/

    hasShown() {
        return this.options.some((option) => {
            return option.shown;
        });
    }

    hasSelected() {
        return this.options.some((option) => {
            return option.selected;
        });
    }

    hasShownSelected() {
        return this.options.some((option) => {
            return option.shown && option.selected;
        });
    }

    private getFirstShown(): Option {
        for (let option of this._options) {
            if (option.shown) {
                return option;
            }
        }
        return null;
    }

    private getFirstShownSelected(): Option {
        for (let option of this._options) {
            if (option.shown && option.selected) {
                return option;
            }
        }
        return null;
    }
}
