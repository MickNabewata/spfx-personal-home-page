import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart, IPropertyPaneConfiguration } from '@microsoft/sp-webpart-base';
import * as strings from 'PersonalHomePageWebPartStrings';
import PersonalHomePage, { IProps as PersonalHomePageProps } from './components/personalHomePage/PersonalHomePage';

/** マニフェストで定義したプロパティの型定義 */
export interface IProps {
}

/** マイページ Webパーツ */
export default class PersonalHomePageWebPart extends BaseClientSideWebPart<IProps> {

  /** レンダリング */
  public render(): void {
    ReactDom.render(
      React.createElement(
        PersonalHomePage,
        {
          mode: this.displayMode,
          currentSiteUrl: this.context.pageContext.web.absoluteUrl,
          currentUserEmail: this.context.pageContext.user.email,
          description: strings.Description,
          myPageFolderLinkText: strings.MyPageFolderLinkText,
        } as PersonalHomePageProps),
      this.domElement);
  }

  /** プロパティウィンドウ定義 */
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: []
    };
  }

  /** コンポーネント破棄イベント */
  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  /** データバージョン取得 */
  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }
}
