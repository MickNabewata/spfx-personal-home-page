import * as deepmerge from 'deepmerge';

/** URLパラメータ操作ユーティリティ */
export default class QueryUtil {

    /** URLパラメータ */
    public params : any = {};

    /** 区切り文字 */
    private delimiter : string | undefined = undefined;

    /** URLパラメータを取得 */
    public get(delimiter? : string) : QueryUtil {
        try
        {
            this.params = {};
            this.delimiter = delimiter;

            //URLパラメータを文字列で取得(?含む)
            let urlParamStr = window.location.search;

            if (urlParamStr) {
                //?を除去
                urlParamStr = urlParamStr.substring(1);

                //urlパラメータをオブジェクトにまとめる
                urlParamStr.split('&').forEach(param => {
                    let temp = param.split('=');

                    //pramsオブジェクトにパラメータを追加
                    this.params = {
                        ...this.params,
                        [temp[0]]: (this.delimiter) ? temp[1].split(this.delimiter) : temp[1]
                    };
                });
            }
        }
        catch
        {
            
        }

        // 自身のインスタンスを返却
        return this;
    }

    /** URLパラメータに値を追加 */
    public add(params : {}) : QueryUtil {

        try
        {
            if(params)
            {
                if(!this.params) this.params = {};
                this.params = deepmerge.all([this.params, params]);
            }
        }
        catch
        {

        }

        /** 自身のインスタンスを返却 */
        return this;
    }

    /** URLパラメータから値を削除 */
    public remove(key : string, value : string) : QueryUtil {

        try
        {
            if(key && key.length > 0 && value && value.length > 0 && this.params[key]) {
                if(Array.isArray(this.params[key]))
                {
                    let p : string[] = this.params[key];
                    if(p)
                    {
                        this.params[key] = p.filter(n => n !== value);
                    }
                }
                else
                {
                    let p : string = this.params[key];
                    if(p)
                    {
                        this.params[key] = p.replace(value, '');
                    }
                }
            }
        }
        catch
        {

        }

        // 自身のインスタンスを返却
        return this;
    }

    /** URLパラメータを文字列化 */
    public toString(keys : string[]) : string {
        let ret : string = '';

        try
        {
            if(keys) {
                let temp : string[] = [];
                keys.forEach((key)=> {
                    let val = this.params[key];
                    if(val && val.length > 0)
                    {
                        temp.push(`${key}=${(Array.isArray(val)? Array.from(new Set(val)).join(this.delimiter) : val)}`);
                    }
                });
                ret = temp.join('&');
            }
        }
        catch
        {

        }

        return (ret.length > 0)? `?${ret}` : '';
    }
}