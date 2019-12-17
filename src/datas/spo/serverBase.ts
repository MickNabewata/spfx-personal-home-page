import { ISingleFilter, IMultiFilter, IOrder } from '../iDatas';
import ISpoDatas, { IClientListItem, IServerListItem, IClientUser, IServerFolder, IServerFile } from './iSpoDatas';
import { Web, List, File as SPFile } from "@pnp/sp";
import { toNumber } from '../../utils/typeConverter';
import 'moment/locale/ja';
import * as moment from 'moment';

/** SharePointデータ操作基底クラス */
export default class ServerBase<ClientType extends IClientListItem, ServerType extends IServerListItem> implements ISpoDatas<ClientType, ServerType> {
    /** SharePoint サイトURL */
    protected _webUrl: string;
    /** リスト名 */
    protected _listName: string;

    /** SharePointデータ操作基底クラス */
    constructor(webUrl: string) {
        this._webUrl = webUrl;
    }

    /** データ取得 */
    public get(filters?: Array<ISingleFilter | IMultiFilter>, order?: IOrder, options?: any[]): Promise<ClientType[]> {
        try {
            // フィルタ文字列展開
            return this.createFilterStrings(filters).then(
                (filterString) => {
                    // 問い合わせ
                    let request = this.getList().items;
                    if (filterString) request = request.filter(filterString);
                    if (order) request = request.orderBy(order.fieldInternalName, (order.operator === 'asc'));
                    return request.get<ServerType[]>().then(
                        (response) => {
                            return this.toClientTypes(response).then(
                                (tVals) => {
                                    return Promise.resolve(tVals);
                                },
                                (err) => {
                                    return Promise.reject(err);
                                }
                            );
                        },
                        (err) => {
                            const msg = (err) ? (err.message) ? err.message : JSON.stringify(err) : '';
                            return Promise.reject(`リクエストエラー：${msg}`);
                        }
                    );
                },
                (err) => {
                    const msg = (err) ? JSON.stringify(err) : '';
                    return Promise.reject(`フィルタ文字列展開エラー：${msg}`);
                }
            );


        } catch (ex) {
            const msg = (ex) ? JSON.stringify(ex) : '';
            return Promise.reject(`不明なエラー：${msg}`);
        }
    }

    /** データ更新(IDがundefinedなら新規登録) 完了後、IDを返却 */
    public set(data: ClientType, options?: any[]): Promise<ClientType> {
        try {
            // データ追加/更新
            let task: Promise<ClientType>;
            if (data && data.Id) {
                task = this.updateItem(data);
            } else {
                task = this.addItem(data);
            }
            if (task) {
                return task.then(
                    (result) => {
                        // 成功
                        return Promise.resolve(result);
                    },
                    (err) => {
                        return Promise.reject(err);
                    }
                );
            } else {
                return Promise.reject('data is null.');
            }
        } catch (ex) {
            const msg = (ex) ? JSON.stringify(ex) : '';
            return Promise.reject(`不明なエラー：${msg}`);
        }
    }

    /** リストURL取得 */
    public getServerRelativeUrl(): Promise<string> { 
        try {
            return this.getList().rootFolder.get<IServerFolder>().then(
                (folder) => {
                    return Promise.resolve((folder)? folder.ServerRelativeUrl: undefined);
                },
                (err) => {
                    const msg = (err) ? (err.message) ? err.message : JSON.stringify(err) : '';
                    return Promise.reject(`リクエストエラー：${msg}`);
                }
            );
        } catch (ex) {
            const msg = (ex) ? JSON.stringify(ex) : '';
            return Promise.reject(`不明なエラー：${msg}`);
        }
    }

    /** サブフォルダURLをサイト内相対パスとして解決 */
    public retriveSubFolderPath(subFolderPath: string): Promise<string> {
        try {
            return this.getServerRelativeUrl().then(
                (listUrl) => {
                    const folderPath = `${listUrl}/${subFolderPath}`;
                    return this.getWeb().getFolderByServerRelativeUrl(folderPath).get<IServerFolder>().then(
                        (folder) => {
                            if (folder && folder.Exists && folder.ServerRelativeUrl === folderPath) {
                                return Promise.resolve(folderPath);
                            } else {
                                return Promise.resolve(undefined);
                            }
                        },
                        (err) => {
                            return Promise.resolve(undefined);
                        }
                    );
                },
                (err) => {
                    const msg = (err) ? (err.message) ? err.message : JSON.stringify(err) : '';
                    return Promise.reject(`リクエストエラー：${msg}`);
                }
            );
        } catch (ex) {
            const msg = (ex) ? JSON.stringify(ex) : '';
            return Promise.reject(`不明なエラー：${msg}`);
        }
    }

    /** ファイル存在有無 */
    public isExistFile(filePath): Promise<boolean> {
        try {
            return this.getWeb().getFileByServerRelativeUrl(filePath).get<IServerFile>().then(
                (file) => {
                    if (file && file.Exists) {
                        return Promise.resolve(true);
                    } else {
                        return Promise.resolve(false);
                    }
                },
                (err) => {
                    return Promise.resolve(false);
                }
            );
        } catch (ex) {
            const msg = (ex) ? JSON.stringify(ex) : '';
            return Promise.reject(`不明なエラー：${msg}`);
        }
    }

    /** 指定IDのファイルを別フォルダにコピー */
    public copyFileTo(sourceFilePath: string, newFilePath: string, overwrite: boolean): Promise<void> {
        try {
            const sourceFileRequest = this.getWeb().getFileByServerRelativeUrl(sourceFilePath);
            return sourceFileRequest.get<IServerFolder>().then(
                (sourceFile) => {
                    if (sourceFile && sourceFile.Exists === true) {
                        return sourceFileRequest.copyTo(newFilePath, overwrite).then(
                            () => { 
                                return this.getWeb().getFileByServerRelativeUrl(newFilePath).publish().then(
                                    () => {
                                        return Promise.resolve();
                                    },
                                    (err) => {
                                        const msg = (err) ? (err.message) ? err.message : JSON.stringify(err) : '';
                                        return Promise.reject(`マイページの発行に失敗しました。権限を確認してください。}`);
                                    }
                                );
                            },
                            (err) => {
                                const msg = (err) ? (err.message) ? err.message : JSON.stringify(err) : '';
                                return Promise.reject(`ファイルコピーに失敗しました。権限を確認してください。}`);
                            }
                        );
                    } else {
                        return Promise.reject(`コピー元ファイル ${sourceFilePath} が存在しません。`);
                    }
                },
                (err) => {
                    return Promise.reject(`コピー元ファイル ${sourceFilePath} が存在しません。`);
                }
            );
        } catch (ex) {
            const msg = (ex) ? JSON.stringify(ex) : '';
            return Promise.reject(`不明なエラー：${msg}`);
        }
    }

    /** SharePoint Web取得 */
    protected getWeb(): Web {
        return new Web(this._webUrl);
    }

    /** SharePoint リスト取得 */
    protected getList(): List {
        return this.getWeb().lists.getByTitle(this._listName);
    }

    /** データ追加 */
    protected addItem(data: ClientType): Promise<ClientType> {
        // 型変換
        return this.toServerType(data).then(
            (serverData) => {
                const request = this.getList().items;
                return request.add(serverData).then(
                    (response) => {
                        return this.toClientType(response.data).then(
                            (result) => {
                                return Promise.resolve(result);
                            },
                            (err) => {
                                return Promise.reject(err);
                            }
                        );
                    },
                    (err) => {
                        const msg = (err) ? JSON.stringify(err) : '';
                        return Promise.reject(`リクエストエラー：${msg}`);
                    }
                );
            },
            (err) => {
                return Promise.reject(err);
            }
        );
    }

    /** データ更新 */
    protected updateItem(data: ClientType): Promise<ClientType> {
        // 型変換
        return this.toServerType(data).then(
            (spoData) => {
                const request = this.getList().items.getById(data.Id);
                return request.update(spoData).then(
                    (response) => {
                        // 更新の時はデータが返らないのでキーだけ返す
                        let result: ClientType;
                        result.Id = data.Id;
                        return Promise.resolve(result);
                    },
                    (err) => {
                        const msg = (err) ? JSON.stringify(err) : '';
                        return Promise.reject(`リクエストエラー：${msg}`);
                    }
                );
            },
            (err) => {
                return Promise.reject(err);
            }
        );
    }

    /** フィルタをODataクエリ文字列に展開 */
    protected createFilterStrings(filters?: Array<ISingleFilter | IMultiFilter>): Promise<string> {
        let filterStrings: string[] = [];
        if (filters) {
            return this.convertFilters(filters).then(
                (result) => {
                    result.forEach((filter) => {
                        if (filter.value) {
                            switch (filter.operator) {
                                case 'in':
                                    let inStrings: string[] = [];
                                    filter.value.forEach((val) => {
                                        inStrings.push(`${filter.fieldInternalName} eq '${val}'`);
                                    });
                                    filterStrings.push(`(${inStrings.join(' or ')})`);
                                    break;
                                default:
                                    filterStrings.push(`${filter.fieldInternalName} ${filter.operator} '${filter.value}'`);
                                    break;
                            }
                        }
                    });

                    return Promise.resolve(filterStrings.join(' and '));
                },
                (err) => {
                    return Promise.reject(err);
                }
            );
        } else {
            return Promise.resolve('');
        }
    }

    /** ソートをODataクエリ文字列に展開 */
    protected createOrderString(order?: IOrder): string {
        let orderString: string = '';
        if (order) {
            const spoOrder = this.convertSort(order);
            orderString = `${spoOrder.fieldInternalName} ${spoOrder.operator}`;
        }
        return orderString;
    }

    /** 複数のサーバー応答をクライアントで扱う型に変換 */
    protected toClientTypes(vals: ServerType[]): Promise<ClientType[]> {
        if (vals && Array.isArray(vals)) {
            let tasks: Promise<ClientType>[] = [];
            for (let i = 0; i < vals.length; i++) {
                tasks.push(this.toClientType(vals[i]));
            }
            return Promise.all(tasks).then(
                (results) => {
                    return Promise.resolve(results);
                },
                (err) => {
                    const msg = (err) ? JSON.stringify(err) : '';
                    return Promise.reject(msg);
                }
            );
        } else {
            return Promise.resolve([]);
        }
    }

    /** サーバー応答をクライアントで扱う型に変換 */
    protected toClientType(val: ServerType): Promise<ClientType> {
        // 登録者を解決
        return this.retriveUser(val.AuthorId).then(
            (author) => {
                // 更新者を解決
                return this.retriveUser(val.EditorId).then(
                    (editor) => {
                        let ret: ClientType;
                        ret.Id = toNumber(val.Id);
                        ret.Title = val.Title;
                        ret.Author = author;
                        ret.Created = (val.Created) ? moment(val.Created) : undefined;
                        ret.Editor = editor;
                        ret.Modified = (val.Modified) ? moment(val.Modified) : undefined;

                        return Promise.resolve(ret);
                    },
                    (err) => {
                        return Promise.reject(err);
                    }
                );
            },
            (err) => {
                return Promise.reject(err);
            }
        );
    }

    /** クライアントで扱う型をサーバーへのデータ書き込みに必要な形式に変換 */
    protected toServerType(val: ClientType): Promise<ServerType> {

        // 型変換
        let ret: ServerType;
        if (val) {
            if (val.Id) ret.Id = val.Id.toString();
            if (val.Title) ret.Title = val.Title;
            if (val.Created) ret.Created = val.Created.toLocaleString();
            if (val.Modified) ret.Modified = val.Modified.toLocaleString();
        }

        // ユーザー列を解決
        return this.ensureUser(ret.AuthorId).then(
            (author) => {
                if(author && author.id) ret.AuthorId = author.id.toString();
                return this.ensureUser(ret.EditorId).then(
                    (editor) => {
                        if (editor && editor.id) ret.EditorId = editor.id.toString();
                        return Promise.resolve(ret);
                    },
                    (err) => {
                        return Promise.reject(err);
                    }
                );
            },
            (err) => {
                return Promise.reject(err);
            }
        );
    }

    /** 指定ログイン名のユーザーがサイトに存在すればそれを返却 存在しなければ登録してからそれを返却 */
    protected ensureUser(loginName: string): Promise<IClientUser> {
        if (loginName) {
            return this.getWeb().ensureUser(loginName).then(
                (user) => {
                    if (user && user.data) {
                        return Promise.resolve({
                            id: user.data.Id,
                            email: user.data.Email,
                            displayName: user.data.Title
                        } as IClientUser);
                    } else {
                        return Promise.reject(`サイトユーザー解決エラー`);
                    }
                },
                (err) => {
                    const msg = (err) ? JSON.stringify(err) : '';
                    return Promise.reject(`サイトユーザー解決エラー：${msg}`);
                }
            );
        } else {
            return Promise.reject('user loginName is null.');
        }
    }

    /** IDを元にサイトユーザーを取得 */
    protected retriveUser(userId: string): Promise<IClientUser> {
        const nmId = toNumber(userId);
        if (nmId) {
            return this.getWeb().getUserById(nmId).get().then(
                (user) => {
                    return Promise.resolve({
                        id: nmId,
                        email: user.Email,
                        displayName: user.Title
                    } as IClientUser);
                },
                (err) => {
                    const msg = (err) ? JSON.stringify(err) : '';
                    return Promise.reject(`ユーザー取得エラー：${msg}`);
                }
            );
        } else {
            return Promise.resolve(undefined);
        }
    }

    /** フィルタをSharePoint REST APIでのODataクエリに必要な形式に変換 */
    protected convertFilters(filters?: Array<ISingleFilter | IMultiFilter>): Promise<Array<ISingleFilter | IMultiFilter>> {
        // ユーザー列
        return this.convertUserFilters(filters, ['Author', 'Editor']).then(
            (result) => {
                return Promise.resolve(result);
            },
            (err) => {
                return Promise.reject(err);
            }
        );
    }

    /** ユーザー列のフィルタ(複数)をSharePoint REST APIでのODataクエリに必要な形式に変換 */
    protected convertUserFilters(filters: Array<ISingleFilter | IMultiFilter>, fieldInternalNames: string[]): Promise<Array<ISingleFilter | IMultiFilter>> {
        if (filters && fieldInternalNames && fieldInternalNames.length > 0) {
            let filter = filters.filter((v) => { return (v.fieldInternalName === fieldInternalNames[0]); });
            if (filter && filter.length > 0) {
                return this.convertUserFilter(filter[0]).then(
                    (result) => {
                        filters[fieldInternalNames[0]] = result;
                        fieldInternalNames.splice(0, 1);
                        return this.convertUserFilters(filters, fieldInternalNames);
                    },
                    (err) => {
                        return Promise.reject(err);
                    }
                );
            } else {
                fieldInternalNames.splice(0, 1);
                return this.convertUserFilters(filters, fieldInternalNames);
            }
        } else {
            return Promise.resolve(filters);
        }
    }

    /** ユーザー列のフィルタをSharePoint REST APIでのODataクエリに必要な形式に変換 */
    protected convertUserFilter(filter: ISingleFilter | IMultiFilter, valueIndex?: number): Promise<ISingleFilter | IMultiFilter> {
        if (filter && filter.fieldInternalName && filter.operator && filter.value) {
            filter.fieldInternalName = `${filter.fieldInternalName}Id`;
            if (filter.operator === 'in') {
                // IMultiFilter
                const i = (valueIndex) ? valueIndex : 0;
                if (filter.value.length > i) {
                    return this.ensureUser(filter.value[i]).then(
                        (result) => {
                            if (result && result.id) filter.value[i] = result.id.toString();
                            return this.convertUserFilter(filter, i + 1);
                        },
                        (err) => {
                            return Promise.reject(err);
                        }
                    );
                } else {
                    return Promise.resolve(filter);
                }
            } else {
                // ISingleFilter
                return this.ensureUser(filter.value).then(
                    (result) => {
                        if (result && result.id) filter.value = result.id.toString();
                        return filter;
                    },
                    (err) => {
                        return Promise.reject(err);
                    }
                );
            }
        } else {
            return Promise.resolve(filter);
        }
    }

    /** ソートをSharePoint REST APIでのODataクエリに必要な形式に変換 */
    protected convertSort(order?: IOrder): IOrder {
        return order;
    }
}