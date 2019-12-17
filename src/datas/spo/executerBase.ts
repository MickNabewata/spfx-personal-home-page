import { Environment, EnvironmentType } from '@microsoft/sp-core-library';
import { ISingleFilter, IMultiFilter, IOrder } from '../iDatas';
import ISpoDatas, { IClientListItem, IServerListItem } from './iSpoDatas';

/** データ操作基底クラス */
export default class ExecuterBase<ClientType extends IClientListItem, ServerType extends IServerListItem> implements ISpoDatas<ClientType, ServerType> {
    /** データ操作クラス */
    protected _manager: ISpoDatas<ClientType, ServerType>;

    /** コンストラクタ */
    constructor(webUrl: string) {
        switch (Environment.type) {
            // テストまたはローカルNodeJSではテストデータを返却
            case EnvironmentType.Test:
            case EnvironmentType.Local:
                this._manager = this.getTestDatas(webUrl);
                break;
            // SharePointモダンまたはクラシックではリストからデータを取得して返却
            default:
                this._manager = this.getServerDatas(webUrl);
                break;
        }
    }

    /** データ取得 */
    public get(filters?: Array<ISingleFilter | IMultiFilter>, order?: IOrder, options?: any[]): Promise<ClientType[]> {
        if (this._manager) {
            return this._manager.get(filters, order, options);
        } else {
            return Promise.reject('データ操作クラスが初期化されていません。');
        }
    }

    /** データ更新(IDがundefinedなら新規登録) 完了後、IDを返却 */
    public set(data: ClientType, options?: any[]): Promise<ClientType> {
        if (this._manager) {
            return this._manager.set(data, options);
        } else {
            return Promise.reject('データ操作クラスが初期化されていません。');
        }
    }

    /** リストURL取得 */
    public getServerRelativeUrl(): Promise<string> {
        if (this._manager) {
            return this._manager.getServerRelativeUrl();
        } else {
            return Promise.reject('データ操作クラスが初期化されていません。');
        }
    }

    /** サブフォルダURLをサイト内相対パスとして解決 */
    public retriveSubFolderPath(subFolderPath: string): Promise<string> {
        if (this._manager) {
            return this._manager.retriveSubFolderPath(subFolderPath);
        } else {
            return Promise.reject('データ操作クラスが初期化されていません。');
        }
    }

    /** ファイル存在有無 */
    public isExistFile(filePath): Promise<boolean> {
        if (this._manager) {
            return this._manager.isExistFile(filePath);
        } else {
            return Promise.reject('データ操作クラスが初期化されていません。');
        }
    }

    /** 指定IDのファイルを別フォルダにコピー */
    public copyFileTo(sorceFilePath: string, newFilePath: string, overwrite: boolean): Promise<void> {
        if (this._manager) {
            return this._manager.copyFileTo(sorceFilePath, newFilePath, overwrite);
        } else {
            return Promise.reject('データ操作クラスが初期化されていません。');
        }
    }

    /** テスト用データ操作クラス取得 */
    protected getTestDatas(webUrl: string): ISpoDatas<ClientType, ServerType> {
        return null;
    }

    /** 本番用データ操作クラス取得 */
    protected getServerDatas(webUrl: string): ISpoDatas<ClientType, ServerType> {
        return null;
    }
}