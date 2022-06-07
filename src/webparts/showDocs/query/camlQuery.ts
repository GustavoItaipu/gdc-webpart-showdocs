export const qry_dets: string = `
<View>
    <Query>
        <Where>
            <IsNotNull><FieldRef Name='LinkFilename' /></IsNotNull>
        </Where>
    </Query>
</View>
`;


export const qry_LargeDocLib: string = `
<View Scope =\"Recursive\">
    <Query>
        <Where>
                <And>
                    <Geq>
                        <FieldRef Name="ID"/>
                        <Value Type="Number">{{minid}}</Value>
                    </Geq>
                    <Lt>
                        <FieldRef Name="ID"/>
                        <Value Type="Number">{{maxid}}</Value>
                    </Lt>
                </And>
        </Where>
        <OrderBy>
            <FieldRef Name="ID" Ascending='FALSE'/>
        </OrderBy>
        <RowLimit>5</RowLimit>
    </Query>
</View>
`;




export const qry_getDocLib: string = `
<View Scope =\"RecursiveAll\">
    <Query>
        <Where>
        <And>
        <And>
            <And>
                <And>
                    <Geq>
                        <FieldRef Name="ID"/>
                        <Value Type="Number">{{minid}}</Value>
                    </Geq>
                    <Lt>
                        <FieldRef Name="ID"/>
                        <Value Type="Number">{{maxid}}</Value>
                    </Lt>
                </And>
                <Contains>
                    <FieldRef Name="ItTipo"/>
                    <Value Type="Text">{{searchKey}}</Value>
                </Contains>
            </And>
            <Contains>
                    <FieldRef Name="ItAno"/>
                    <Value Type="Text">{{year}}</Value>
            </Contains>
        </And>
            <Eq>
                <FieldRef Name='FSObjType' />
                <Value Type='Integer'>0</Value>
            </Eq>
            </And>
        </Where>
        <OrderBy>
            <FieldRef Name="Modified" Ascending='FALSE'/>
        </OrderBy>
    </Query>
    <RowLimit>{{quantItems}}</RowLimit>
</View>
`;


export const qry_getFile: string = `
<View Scope =\"RecursiveAll\">
   <Query>
      <Where>
         <And>
            <And>
               <And>
                  <And>
                     <And>
                        <Geq>
                           <FieldRef Name="ID" />
                           <Value Type="Number">{{minid}}</Value>
                        </Geq>
                        <Lt>
                           <FieldRef Name="ID" />
                           <Value Type="Number">{{maxid}}</Value>
                        </Lt>
                     </And>
                     <Contains>
                        <FieldRef Name="ItTipo" />
                        <Value Type="Text">{{searchKey}}</Value>
                     </Contains>
                  </And>
                  <Leq>
                     <FieldRef Name="Modified" />
                     <Value IncludeTimeValue="FALSE" Type="DateTime">{{beginYear}}</Value>
                  </Leq>
               </And>
               <Geq>
                  <FieldRef Name="Modified" />
                  <Value IncludeTimeValue="FALSE" Type="DateTime">{{endYear}}</Value>
               </Geq>
            </And>
            <Eq>
               <FieldRef Name="FSObjType" />
               <Value Type="Integer">0</Value>
            </Eq>
         </And>
      </Where>
      <OrderBy>
         <FieldRef Name="Modified" Ascending="FALSE" />
      </OrderBy>
   </Query>
</View>
`;