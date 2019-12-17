import TestBase from '../testBase';

interface Window { _testDatas: any; }
declare var window: Window;

/** SharePoint テストデータ取得基底クラス */
export default class SpoTestBase<ClientType, ServerType> extends TestBase<ClientType, ServerType> {
    /** SharePoint サイトURL */
    protected _webUrl: string;
    /** リスト名 */
    protected _listName: string;

    /** SharePoint テストデータ取得基底クラス */
    constructor(webUrl: string) {
        super();
        this._webUrl = webUrl;
    }

    /** リストURL取得 */
    public getServerRelativeUrl(): Promise<string> {
        return new Promise((resolve: (url: string) => void, reject: (err) => void) => {
            resolve(`/sites/${this._webUrl}/lists/${this._listName}`);
        });
    }

    /** サブフォルダURLをサイト内相対パスとして解決 */
    public retriveSubFolderPath(subFolderPath: string): Promise<string> {
        return new Promise((resolve: (isExists: string) => void, reject: (err) => void) => { resolve(`${this._listName}/${subFolderPath}`); });
    }

    /** ファイル存在有無 */
    public isExistFile(filePath): Promise<boolean> {
        return new Promise((resolve: (url: boolean) => void, reject: (err) => void) => {
            resolve(false);
        });
    }

    /** 指定IDのファイルを別フォルダにコピー */
    public copyFileTo(sorceFilePath: string, newFilePath: string, overwrite: boolean): Promise<void> {
        return new Promise((resolve: () => void, reject: (err) => void) => { resolve(); });
    }

    /** データをグローバルに格納 */
    protected setToGlobal(datas: ClientType[]) {
        if (this._listName) {
            if (!window._testDatas) window._testDatas = {};
            if (!window._testDatas[this._webUrl]) window._testDatas[this._webUrl] = {};
            window._testDatas[this._webUrl][this._listName] = datas;
        }
    }

    /** データをグローバルに格納 */
    protected pushToGlobal(data: ClientType) {
        const datas = this.getFromGlobal();
        if (datas) {
            const newDatas = Array.from(datas);
            newDatas.push(data);
            this.setToGlobal(newDatas);
        }
    }

    /** データをグローバルから取得 */
    protected getFromGlobal(): ClientType[] {
        if (this._listName) {
            if (!(window._testDatas && window._testDatas[this._webUrl] && window._testDatas[this._webUrl][this._listName])) this.setToGlobal(this.generateTestDatas());
            return Array.from(window._testDatas[this._webUrl][this._listName]);
        }
        else {
            return [];
        }
    }
}