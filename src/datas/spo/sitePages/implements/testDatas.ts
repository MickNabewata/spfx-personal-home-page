import { ClientType, ServerType } from '../executer';
import ISpoDatas from '../../iSpoDatas';
import TestBase from '../../spoTestBase';
import 'moment/locale/ja';
import * as moment from 'moment';

/** サイトのページ 取得クラス */
export default class TestDatas extends TestBase<ClientType, ServerType> implements ISpoDatas<ClientType, ServerType> {

    /** リスト名 */
    protected _listName: string = 'サイトのページ';
    /** キー列名 */
    protected _key: string = 'id';

    /** テストデータ生成 */
    protected generateTestDatas(): ClientType[] {
        let ret: ClientType[] = [];

        // 3件
        let i = 0;
        let pad_i = '';
        for (i = 0; i < 3; i++) {
            pad_i = i.toString().padStart(3, '0');
            ret.push({
                Id: i,
                Title: `title-${pad_i}`,
                Author: { id: i, displayName: `autor-${pad_i}`, email: `autor-${pad_i}@contoso.com` },
                Created: moment().year(2019).month(1).date(i),
                Editor: { id: i, displayName: `editor-${pad_i}`, email: `editor-${pad_i}@contoso.com` },
                Modified: moment().year(2019).month(1).date(i)
            });
        }

        return ret;
    }
}