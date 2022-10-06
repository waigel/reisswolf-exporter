export interface DocumentProp {
  name: string;
  value: any;
  type: string;
  title: string;
  group: string;
}

export interface ReisswolfDocument {
  id: number;
  type: string;
  name: string;
  uuid: string;
  title?: any;
  path?: any;
  dateCreated: Date;
  lastUpdated: Date;
  createdBy: string;
  updatedBy: string;
  privileges: string[];
  tags: string[];
  versionLabel?: any;
  checkedOutBy?: any;
  checkedOut?: any;
  contentTypeMime: string;
  contentTypeName: string;
  contentTypeExtension: string;
  contentLength: number;
  contentUrl: string;
  workingCopyUuid?: any;
  workingCopyPrivileges?: any;
  workingCopyContentUrl?: any;
  props: DocumentProp[];
  fullTextContent?: any;
}
