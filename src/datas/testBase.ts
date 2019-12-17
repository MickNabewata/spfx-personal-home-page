import { ISingleFilter, IMultiFilter, IOrder } from './iDatas';

/** テストデータ取得基底クラス */
export default class TestBase<ClientType, ServerType> {
    /** キー列名 */
    protected _key: string;

    /** データ取得 (フィルタ演算子はeqのみ対応)) */
    public get(filters?: Array<ISingleFilter | IMultiFilter>, order?: IOrder): Promise<ClientType[]> {
        return new Promise<ClientType[]>((resolve: (value?: ClientType[]) => void, reject: (reason?: any) => void) => {
            let datas: ClientType[] = this.getFromGlobal();

            // フィルタ
            datas = this.filterDatas(datas, filters);

            // ソート
            datas = this.sortDatas(datas, order);

            resolve(datas);
        });
    }

    /** データ更新(IDがundefinedなら新規登録) 完了後、IDを返却 */
    public set(data: ClientType): Promise<ClientType> {
        return new Promise((resolve: (ret: ClientType) => void, reject: (reason?: any) => void) => {
            let ret: ClientType;

            if (data) {
                if (data[this._key]) {
                    ret = this.update(data);
                } else {
                    ret = this.add(data);
                }
            }

            resolve(ret);
        });
    }

    /** データのフィルタリング */
    protected filterDatas(datas: ClientType[], filters?: Array<ISingleFilter | IMultiFilter>): ClientType[] {
        if (datas && filters) {
            return datas.filter((data: ClientType) => {
                let ret = true;

                for (let i = 0; i < filters.length; i++) {
                    ret = this.filterData(data, filters[i]);

                    // 1つでもfalseなら終了(AND条件)
                    if (ret === false) i = filters.length;
                }

                return ret;
            });
        } else {
            return datas;
        }
    }

    /** データのソート */
    protected sortDatas(datas: ClientType[], order?: IOrder) {
        if (datas && order) {
            return datas.sort((bef, aft) => {
                const data1 = bef[order.fieldInternalName];
                const data2 = aft[order.fieldInternalName];
                let result = (data1 < data2) ? 1 : (data1 === data2) ? 0 : -1;
                if (order.operator === 'asc') result = result * -1;
                return result;
            });
        } else {
            return datas;
        }
    }

    /** データ更新 */
    protected update(data: ClientType) {
        let ret: ClientType;

        const datas = this.getFromGlobal();
        for (let i = 0; i < datas.length; i++) {
            if (datas[i][this._key] === data[this._key]) {
                ret = datas[i] as any;
                Object.keys(data).forEach((key) => {
                    if (data[key] !== undefined) {
                        datas[i][key] = data[key];
                    }
                });
                i = datas.length;
            }
        }

        return ret;
    }

    /** データ追加 */
    protected add(data: ClientType) {
        const datas = this.getFromGlobal();
        data[this._key] = datas[datas.length - 1][this._key] + 1;
        this.pushToGlobal(data);
        return data;
    }

    /** テストデータ生成 */
    protected generateTestDatas(): ClientType[] {
        return [];
    }

    /** データのフィルタリング in未対応 */
    protected filterData(data: ClientType, filter: ISingleFilter | IMultiFilter): boolean {
        // 大文字・小文字を区別しない
        let ret = false;
        if (data) {
            const keys = Object.keys(data);
            if (keys) {
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    const type = (data[key])? Object.prototype.toString.call(data[key]): '';
                    const value = (type === '[object Date]') ? data[key].toLocaleString() : data[key].toString();
                    
                    if (key.toLocaleLowerCase() === filter.fieldInternalName.toLocaleLowerCase()) {
                        switch (filter.operator) {
                            case 'eq':
                                ret = (value === filter.value);
                                break;
                            case 'le':  
                                ret = (value <= filter.value);
                                break;
                            case 'lt':
                                ret = (value < filter.value);
                                break;
                            case 'ge':
                                ret = (value >= filter.value);
                                break;
                            case 'gt':
                                ret = (value > filter.value);
                                break;
                            case 'in':
                                ret = filter.value.includes(value);
                                break;
                        }
                    }
                    if (ret === true) { i = keys.length; }
                }
            }
        }

        return ret;
    }

    /** データをグローバルに格納 */
    protected setToGlobal(datas: ClientType[]) {
    }

    /** データをグローバルに格納 */
    protected pushToGlobal(data: ClientType) {

    }

    /** データをグローバルから取得 */
    protected getFromGlobal(): ClientType[] {
        return [];
    }
}