/* tslint:disable */
import gql from 'graphql-tag';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type Maybe<T> = T | null;

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Upload: any;
  _Any: any;
  _FieldSet: any;
  Any: any;
  BigInt: any;
  Date: any;
  Email: any;
  Ipv4: any;
  Ipv6: any;
  Mobile: any;
  Object: any;
  URL: any;
  ObjectLiteral: any;
  Empty: any;
  Undefined: any;
  Void: any;
};



export type Query = {
   __typename?: 'Query';
  _service: _Service;
};

export type _Service = {
   __typename?: '_Service';
  sdl?: Maybe<Scalars['String']>;
};

export type Mutation = {
   __typename?: 'Mutation';
  openCamera: RtspUrlOutput;
  createWebRtc: CreateWebRtcOutput;
  connectedWebRtc: ConnectedWebRtcOutput;
};


export type MutationOpenCameraArgs = {
  input: RtspUrlInput;
};


export type MutationCreateWebRtcArgs = {
  input: CreateWebRtcInput;
};


export type MutationConnectedWebRtcArgs = {
  input: ConnectedWebRtcInput;
};

export type RtspUrlInput = {
  rtspUrl: Scalars['String'];
};

export type RtspUrlOutput = {
   __typename?: 'RtspUrlOutput';
  cameraId: Scalars['Int'];
};

export type CreateWebRtcInput = {
  cameraId: Scalars['Int'];
};

export type CreateWebRtcOutput = {
   __typename?: 'CreateWebRtcOutput';
  clientId: Scalars['Int'];
  webRtcInfo: Scalars['String'];
  streamInfo: Scalars['String'];
};

export type ConnectedWebRtcInput = {
  clientId: Scalars['Int'];
  dtlsParameters: Scalars['String'];
};

export type ConnectedWebRtcOutput = {
   __typename?: 'ConnectedWebRtcOutput';
  status: Scalars['Int'];
};

















export type CreateWebRtcMutationVariables = {
  input: CreateWebRtcInput;
};


export type CreateWebRtcMutation = (
  { __typename?: 'Mutation' }
  & { createWebRtc: (
    { __typename?: 'CreateWebRtcOutput' }
    & Pick<CreateWebRtcOutput, 'clientId' | 'webRtcInfo' | 'streamInfo'>
  ) }
);

export type ConnectedWebRtcMutationVariables = {
  input: ConnectedWebRtcInput;
};


export type ConnectedWebRtcMutation = (
  { __typename?: 'Mutation' }
  & { connectedWebRtc: (
    { __typename?: 'ConnectedWebRtcOutput' }
    & Pick<ConnectedWebRtcOutput, 'status'>
  ) }
);

export const CreateWebRtcDocument = gql`
    mutation createWebRtc($input: CreateWebRtcInput!) {
  createWebRtc(input: $input) {
    clientId
    webRtcInfo
    streamInfo
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class CreateWebRtcGQL extends Apollo.Mutation<CreateWebRtcMutation, CreateWebRtcMutationVariables> {
    document = CreateWebRtcDocument;
    
  }
export const ConnectedWebRtcDocument = gql`
    mutation connectedWebRtc($input: ConnectedWebRtcInput!) {
  connectedWebRtc(input: $input) {
    status
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class ConnectedWebRtcGQL extends Apollo.Mutation<ConnectedWebRtcMutation, ConnectedWebRtcMutationVariables> {
    document = ConnectedWebRtcDocument;
    
  }

      export interface IntrospectionResultData {
        __schema: {
          types: {
            kind: string;
            name: string;
            possibleTypes: {
              name: string;
            }[];
          }[];
        };
      }
      const result: IntrospectionResultData = {
  "__schema": {
    "types": []
  }
};
      export default result;
    