/** 単一値フィルター定義 */
export interface ISingleFilter {
    /** フィールド内部名 */
    fieldInternalName: string;
    /** 演算子 */
    operator: ISingleFilterOperator;
    /** 値 */
    value: string;
}

/** 複数値フィルター定義 */
export interface IMultiFilter {
    /** フィールド内部名 */
    fieldInternalName: string;
    /** 演算子 */
    operator: IMultiFilterOperator;
    /** 値 */
    value: string[];
}

/** 単一値フィルター演算子 */
export type ISingleFilterOperator = 'le' | 'lt' | 'eq' | 'gt' | 'ge';

/** 複数値フィルター演算子 */
export type IMultiFilterOperator = 'in';

/** ソート定義 */
export interface IOrder {
    /** フィールド内部名 */
    fieldInternalName: string;
    /** 演算子 */
    operator: IOrderOperator;
}

/** ソート定義 演算子 */
export type IOrderOperator = 'asc' | 'desc';

/** データ操作クラス 形式定義 */
export default interface IDatas<ClientType, ServerType> {
    /** データ取得 */
    get(filters?: Array<ISingleFilter | IMultiFilter>, order?: IOrder, options?: any): Promise<ClientType[]>;

    /** データ更新(IDがundefinedなら新規登録)  完了後、IDを返却*/
    set(data: ClientType, options?: any[]): Promise<ClientType>;
}