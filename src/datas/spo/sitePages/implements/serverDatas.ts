import { ClientType, ServerType } from '../executer';
import ServerBase from '../../serverBase';
import 'moment/locale/ja';
import * as moment from 'moment';

/** サイトのページ 取得クラス */
export default class ServerDatas extends ServerBase<ClientType, ServerType> {

    /** リスト名 */
    protected _listName: string = 'サイトのページ';
}