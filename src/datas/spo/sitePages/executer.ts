import { IClientListItem, IServerListItem, IClientUser } from '../iSpoDatas';
import ServerData from './implements/serverDatas';
import TestData from './implements/testDatas';
import ExecuterBase from '../executerBase';
import 'moment/locale/ja';
import * as moment from 'moment';

/** SharePoint サイトのページ 型定義 */
export interface ServerType extends IServerListItem {
}

/** クライアント サイトのページ 定義 */
export interface ClientType extends IClientListItem {
}

/** サイトのページ データ操作クラス */
export default class Executer extends ExecuterBase<ClientType, ServerType> {

    /** テスト用データ操作クラス取得 */
    protected getTestDatas(webUrl: string) {
        return new TestData(webUrl);
    }

    /** 本番用データ操作クラス取得 */
    protected getServerDatas(webUrl: string) {
        return new ServerData(webUrl);
    }
}