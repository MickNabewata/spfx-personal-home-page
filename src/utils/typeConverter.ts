import { toHalfWidth } from './charWidth';

/** 全角・半角が混在した文字列を半角数字に変換 変換失敗時はundefined */
export function toNumber(str: string): number {
    let ret = undefined;

    if (str) {
        // 半角変換して,を削除
        const halfValue: string = toHalfWidth(str).replace(/,/g, '');
        // 数値チェック
        const matches = halfValue.match(/[+-]?\d+/g);
        if (matches && matches.length === 1 && matches[0].length === halfValue.length) {
            // 数値変換
            ret = Number(halfValue);
        }

    }

    return ret;
}