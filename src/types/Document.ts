export interface DocumentProp {
  name: string;
  value: string | boolean;
  type: string;
  title: string;
  group: string;
}

export interface ReisswolfDocument {
  id: number;
  type: string;
  name: string;
  uuid: string;
  title?: string;
  path?: string;
  dateCreated: Date;
  lastUpdated: Date;
  createdBy: string;
  updatedBy: string;
  privileges: string[];
  tags: string[];
  versionLabel?: string;
  checkedOutBy?: string;
  checkedOut?: string;
  contentTypeMime: string;
  contentTypeName: string;
  contentTypeExtension: string;
  contentLength: number;
  contentUrl: string;
  workingCopyUuid?: string;
  workingCopyPrivileges?: string;
  workingCopyContentUrl?: string;
  props: DocumentProp[];
  fullTextContent?: string;
}
