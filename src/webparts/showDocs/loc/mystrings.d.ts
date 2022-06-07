declare interface IShowDocsWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  ListFieldLabel: string;
  DescriptionFieldLabel: string;
  AppLocalEnvironmentSharePoint: string;
  AppLocalEnvironmentTeams: string;
  AppSharePointEnvironment: string;
  AppTeamsTabEnvironment: string;
}

declare module 'ShowDocsWebPartStrings' {
  const strings: IShowDocsWebPartStrings;
  export = strings;
}
