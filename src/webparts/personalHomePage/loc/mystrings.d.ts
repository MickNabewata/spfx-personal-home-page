/** locフォルダ配下で定義したローカライズ用ファイルの型定義 */
declare interface IPersonalHomePageWebPartStrings {
  /** 説明 */
  Description: string;
  /** マイページフォルダへのリンクテキスト */
  MyPageFolderLinkText: string;
}

/** locフォルダ配下で定義したローカライズ用ファイルの読取結果 */
declare module 'PersonalHomePageWebPartStrings' {
  const strings: IPersonalHomePageWebPartStrings;
  export = strings;
}
