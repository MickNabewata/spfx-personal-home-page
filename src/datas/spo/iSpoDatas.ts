import IDatas from '../iDatas';
import './folders/node_modules/moment/locale/ja';
import * as moment from 'moment';

/** SharePoint リストアイテム型 形式定義 */
export interface IServerListItem {
    /** アイテムID */
    Id?: string;
    /** タイトル */
    Title?: string;
    /** 登録者 */
    AuthorId?: string;
    /** 登録日時 */
    Created?: string;
    /** 更新者 */
    EditorId?: string;
    /** 更新日時 */
    Modified?: string;
}

/** クライアント リストアイテム型 形式定義 */
export interface IClientListItem {
    /** アイテムID */
    Id?: number;
    /** タイトル */
    Title?: string;
    /** 登録者 */
    Author?: IClientUser;
    /** 登録日時 */
    Created?: moment.Moment;
    /** 更新者 */
    Editor?: IClientUser;
    /** 更新日時 */
    Modified?: moment.Moment;
}

/** SharePoint サイトユーザー型 形式定義 */
export interface IClientUser {
    /** ID */
    id: number;
    /** メールアドレス */
    email: string;
    /** 表示名 */
    displayName: string;
}

/** SharePoint フォルダ型 形式定義 */
export interface IServerFolder {
    /** GUID */
    UniqueId?: string;
    /** 存在有無 */
    Exists?: boolean;
    /** 名前 */
    Name?: string;
    /** フォルダパス */
    ServerRelativeUrl?: string;
    /** 登録日時 */
    TimeCreated?: string;
    /** 更新日時 */
    TimeLastModified?: string;
}

/** SharePoint ファイル型 形式定義 */
export interface IServerFile {
    /** GUID */
    UniqueId?: string;
    /** 存在有無 */
    Exists?: boolean;
    /** 名前 */
    Name?: string;
    /** ファイルパス */
    ServerRelativeUrl?: string;
    /** ETag */
    ETagETag?: string;
    /** 登録日時 */
    TimeCreated?: string;
    /** 更新日時 */
    TimeLastModified?: string;
}

/** SharePoint データ操作クラス 形式定義 */
export default interface ISpoDatas<ClientType extends IClientListItem, ServerType extends IServerListItem> extends IDatas<ClientType, ServerType> {
    
    /** リストURL取得 */
    getServerRelativeUrl(): Promise<string>;

    /** サブフォルダURLをサイト内相対パスとして解決 */
    retriveSubFolderPath(subFolderPath: string): Promise<string>;

    /** ファイル存在有無 */
    isExistFile(filePath): Promise<boolean>;

    /** 指定IDのファイルを別フォルダにコピー */
    copyFileTo(sorceFilePath: string, newFilePath: string, overwrite: boolean): Promise<void>;
}