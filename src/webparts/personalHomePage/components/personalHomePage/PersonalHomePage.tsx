import * as React from 'react';
import { DisplayMode } from '@microsoft/sp-core-library';
import styles from './PersonalHomePage.module.scss';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import sitePages from '../../../../datas/spo/sitePages/executer';
import { stringIsNullOrEmpty } from '@pnp/common';
import QueryUtil from '../../../../utils/queryUtil';

/** プロパティ 型定義 */
export interface IProps {
  /** 現在のモード */
  mode: DisplayMode;
  /** 現在のサイトURL */
  currentSiteUrl: string;
  /** 現在のユーザーのEメールアドレス */
  currentUserEmail: string;
  /** 説明 */
  description: string;
  /** マイページフォルダへのリンクテキスト */
  myPageFolderLinkText: string;
}

/** ステート 型定義 */
export interface IStates {
  /** 処理中フラグ */
  processing: boolean;
  /** マイページフォルダのURL */
  myPageFolderUrl: string;
  /** リダイレクト停止フラグ */
  notRedirect: boolean;
  /** ユーザー向けエラーメッセージ */
  err: string;
}

/** マイページ Webパーツ */
export default class PersonalHomePage extends React.Component<IProps, IStates> {

  /** マイページ格納フォルダ名 */
  private myPageFolder = 'MyPages';

  /** マイページ テンプレートファイル名 */
  private myPageTemplate = 'MyPageTemplate.aspx';

  /** マイページ Webパーツ */
  constructor(props: IProps) {
    super(props);

    const params = new QueryUtil().get().params;

    this.state = {
      processing: true,
      myPageFolderUrl: `${props.currentSiteUrl}/SitePages/${this.myPageFolder}`,
      notRedirect: (params && params.redirect) ? (params.redirect === 'false')? true : false : false,
      err: ''
    };
  }

  /** マイページに移動 */
  private redirectToMyPage(folderPath: string, fileName: string) {
    this.setState({
      err: '',
      myPageFolderUrl: folderPath,
      processing: false
    }, () => {
        if (this.props.mode === DisplayMode.Read && this.state.notRedirect === false) {
          window.location.href = `${folderPath}/${fileName}`;
        }
    });
  }

  /** 描画完了イベント */
  public componentDidMount() {
    const props = this.props;
    const state = Object.assign({}, this.state) as IStates;

    // ライブラリ内にフォルダが無ければエラー
    const client = new sitePages(props.currentSiteUrl);
    client.retriveSubFolderPath(this.myPageFolder).then(
      (folderPath) => {
        if (folderPath) {

          // URLを記録
          state.myPageFolderUrl = folderPath;

          // 既にマイページがあれば成功扱い
          const myPageFileName = `${encodeURIComponent(props.currentUserEmail)}.aspx`;
          client.isExistFile(`${folderPath}/${myPageFileName}`).then(
            (exists) => {
              if (exists === true) {
                // 成功
                this.redirectToMyPage(folderPath, myPageFileName);
              } else {
                // マイページ作成
                client.copyFileTo(
                  `${folderPath}/${this.myPageTemplate}`,
                  `${folderPath}/${myPageFileName}`,
                  true
                ).then(
                  () => {
                    // 成功
                    this.redirectToMyPage(folderPath, myPageFileName);
                  },
                  (err) => {
                    // エラーを記録
                    this.setState({
                      err: err,
                      myPageFolderUrl: state.myPageFolderUrl,
                      processing: false
                    });
                  }
                );
              }
            },
            (err) => {
              // エラーを記録
              this.setState({
                err: err,
                myPageFolderUrl: state.myPageFolderUrl,
                processing: false
              });
            }
          );
        } else {
          // エラーを記録
          this.setState({
            err: `${state.myPageFolderUrl} フォルダを作成してください。`,
            processing: false
          });
        }
      },
      (err) => {
        // エラーを記録
        this.setState({
          err: err,
          processing: false
        });
      }
    );
  }

  /** レンダリング */
  public render(): React.ReactElement<IProps> {
    const props = this.props;
    const state = this.state;

    return (
      <div>
        {
          (state.processing === false && props.mode && props.mode === DisplayMode.Edit) ? 
            <React.Fragment>
              <p>{props.description}</p>
              <p>
                <a href={`${state.myPageFolderUrl}`} target='_blank'>{props.myPageFolderLinkText}</a>
              </p>
              <p>{state.err}</p>
            </React.Fragment> :
            (stringIsNullOrEmpty(state.err)) ?
              <Spinner size={SpinnerSize.large} /> :
              <p>{state.err}</p>
        }
      </div>
    );
  }
}
