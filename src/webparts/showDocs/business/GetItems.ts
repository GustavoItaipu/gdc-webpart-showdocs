import { sp } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items/list';
import "@pnp/sp/folders/web";
import { IItem, Items, PagedItemCollection } from '@pnp/sp/items';
import * as HTMLDecoder from 'html-decoder';
import * as Handlebars from "handlebars";
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { IStackTokens } from 'office-ui-fabric-react';
import { qry_dets, qry_LargeDocLib } from '../query/camlQuery';
import { ListFieldLabel } from 'ShowDocsWebPartStrings';
import "@pnp/sp/webs";
import { format } from 'date-fns';

const nameDocLib: string = 'Documentos'
const pageSize: number = 5000;

const _getMaxId = async (listname: string): Promise<number> => {
    let maxItems: any[] = await sp.web.lists.getByTitle(listname).items
        .select('ID')
        .orderBy('ID', false)
        .top(1)
        .get();
    if (maxItems.length > 0) return maxItems[0].ID;
    else return 0;
};

export const _searchDocLib = async (itemsQuery: string, searchKey: string, year: string, quantItems: string): Promise<IItem[]> => {
    let minid: number;
    let maxid: number;
    let beginYear: string = format(new Date(),'yyyy-MM-dd');

    let d = new Date();
    let yearAdd = d.getFullYear();
    let month = d.getMonth();
    let day = d.getDate();
    let endYear: string = format(new Date(yearAdd - 1, month, day),'yyyy-MM-dd');

    let listmaxid: number = await _getMaxId(nameDocLib);
    let maxPage: number = Math.ceil(listmaxid / pageSize);
    let returnItems = [];
    for (var i = 0; i < maxPage; i++) {
        minid = i * pageSize + 1;
        maxid = (i + 1) * pageSize;
        //debugger;
        let camlQuery: string = _getTemplateValue(itemsQuery, { searchKey: searchKey, year: year, quantItems: quantItems, minid: minid, maxid: maxid, beginYear: beginYear, endYear: endYear });
        let retitems: IItem[] = await sp.web.lists.getByTitle(nameDocLib).getItemsByCAMLQuery({
            ViewXml: camlQuery
        });
        if (retitems.length > 0) {
            returnItems = returnItems.concat(retitems);
        }
        if (i >= maxPage - 1) return returnItems;
    }
    returnItems.sort((a,b) => (a.Modified - b.Modified));
    
    return returnItems;
};


export const _normCamlQuery = async (qry: string, searchKey: string, year: string, quantItems: string) => {
    let filItems = await _searchDocLib(qry, searchKey, year, quantItems);
    return filItems;
};

const _getTemplateValue = (template: string, value: any): string => {
    const hTemplate = Handlebars.compile(HTMLDecoder.decode(template));
    return HTMLDecoder.decode(hTemplate(value));
};