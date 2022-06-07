import * as React from 'react';
import { IShowDocsProps } from '../props/IShowDocsProps';
import { escape } from '@microsoft/sp-lodash-subset';
import coreui from '../style/showDocs.module.scss'

export default class ShowDocs extends React.Component<IShowDocsProps, {}> {
  public render(): React.ReactElement<IShowDocsProps> {
    const {
      description,
      isDarkTheme,
      environmentMessage,
      hasTeamsContext,
      userDisplayName,
      listName,
      color,
      quantItems,
      title,
      showIcon,
      fontColor,
    } = this.props;

    

    return (
      <div className={coreui.divTable}>
        <div className={coreui.divTableBody}>
          <div className={coreui.divTableRow}>
            <div className={coreui.divTableCell} style={{ width: "30%" }}>
              <div className={coreui.card}>
                <div></div>
                <div className={coreui.cardBody} style={{ backgroundColor: this.props.color.valueOf() }}>
                  <h5 className={coreui.cardTitle} style={{color:this.props.fontColor}}>{escape(this.props.title)}</h5>
                </div>
                <div id='rca'>
                  <p>{escape(this.props.listName)}</p>
                  <p>{escape(this.props.color)}</p>
                  <p>{this.props.quantItems}</p>
                  <p>{this.props.showIcon}</p>
                  <p>{escape(this.props.userDisplayName)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
