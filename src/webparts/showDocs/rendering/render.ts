import coreui from '../style/showDocs.module.scss'
import { format } from 'date-fns';
import * as HTMLDecoder from 'html-decoder';
import * as Handlebars from "handlebars";


export const body = (date: string): string =>
`
<div class="${coreui.divTableRow}">
    <div class="${coreui.divTableCell}">
        <div class="${coreui.dFlex} ${coreui.w100} ${coreui.element}">
            <img src="https://res-1.cdn.office.net/files/fabric-cdn-prod_20220127.003/assets/item-types/20/docset.svg" alt="Pasta" style="width: 25px;">
            <h5 style="text-transform: uppercase;">{{numberFolder}}</h5>
        </div>
    </div>
<div class="${coreui.divTableCell}">
   <div><h5>Assunto:</h5></div>
    <div>
        {{subject}}
    </div>
</div>
<div class="${coreui.divTableCell}">
   <div><h5>Data:</h5></div>
   <div>
      ${format(new Date(date), 'dd/MM/yyy')}
   </div>
</div>
</div>
` ;

export const _getHTML = async (template: string, value: any): Promise<string> => {
    const hTemplate = Handlebars.compile(HTMLDecoder.decode(template));
    return HTMLDecoder.decode(hTemplate(value));
};


const header: string = `
            <div class="${coreui.divTable}">
                <div class="${coreui.divTableBody}">
                    <div class="${coreui.divTableRow}">
                      <div class="${coreui.divTableCell}" style="${{ width: "30%" }}">
                      <div class=${coreui.card}>
                          <div></div>
                          <div class="${coreui.cardBody}" style="background-color: {{bgColor}}">
                            <h5 class="${coreui.cardTitle}" style="color: {{fontColor }}">{{title}}</h5>
                          </div>
                          <div id='rca'>
                          </div>
                      </div>
                    </div>
                </div>
              </div>
            </div>

`;

export const _header = async (bgColor: string, fontColor: string, title: string) => {
    let html = await _getHTML(header, { bgColor: bgColor, fontColor: fontColor, title: title });
    return html;
}

export const _body = async (date: string, numberFolder: string, subject: string) => {
    let html = _getHTML(body(date), { numberFolder: numberFolder, subject: subject });
    return html;
}



