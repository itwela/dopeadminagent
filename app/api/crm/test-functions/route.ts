import { NextResponse } from 'next/server';
import { crmDbTools } from '@/lib/crm-db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { function: functionName, params } = body;

    let result;

    switch (functionName) {
      case 'listCollections':
        result = await crmDbTools.listCollections();
        break;

      case 'getCollectionInfo':
        if (!params?.collectionName) {
          return NextResponse.json({
            success: false,
            error: 'collectionName is required',
          }, { status: 400 });
        }
        result = await crmDbTools.getCollectionInfo(params.collectionName);
        break;

      case 'getRecentDocuments':
        if (!params?.collectionName) {
          return NextResponse.json({
            success: false,
            error: 'collectionName is required',
          }, { status: 400 });
        }
        result = await crmDbTools.getRecentDocuments(
          params.collectionName,
          params.limit || 10,
          params.sortField || '_id'
        );
        break;

      case 'getRecentExternalObjects':
        result = await crmDbTools.getRecentExternalObjects(
          params?.limit || 10,
          params?.sortField || '_id'
        );
        break;

      case 'getRecentConnections':
        result = await crmDbTools.getRecentConnections(
          params?.limit || 10,
          params?.sortField || '_id'
        );
        break;

      case 'getConnectionsForCustomer':
        if (!params?.accountId) {
          return NextResponse.json({
            success: false,
            error: 'accountId is required',
          }, { status: 400 });
        }
        result = await crmDbTools.getConnectionsForCustomer(
          params.accountId,
          params.limit || 10
        );
        break;

      case 'getConnectionsByDataSource':
        if (!params?.dataSource) {
          return NextResponse.json({
            success: false,
            error: 'dataSource is required',
          }, { status: 400 });
        }
        result = await crmDbTools.getConnectionsByDataSource(
          params.dataSource,
          params.limit || 10
        );
        break;

      case 'getConnectionStats':
        result = await crmDbTools.getConnectionStats();
        break;

      case 'getExternalObjectsByDataSource':
        if (!params?.accountId) {
          return NextResponse.json({
            success: false,
            error: 'accountId is required',
          }, { status: 400 });
        }
        if (!params?.dataSources) {
          return NextResponse.json({
            success: false,
            error: 'dataSources is required (can be a single string or array of strings)',
          }, { status: 400 });
        }
        result = await crmDbTools.getExternalObjectsByDataSource(
          params.accountId,
          params.dataSources,
          params.limit || 20
        );
        break;

      case 'getExternalObjectStatsByDataSource':
        if (!params?.accountId) {
          return NextResponse.json({
            success: false,
            error: 'accountId is required',
          }, { status: 400 });
        }
        result = await crmDbTools.getExternalObjectStatsByDataSource(params.accountId);
        break;

      case 'getExternalObjectsByDataType':
        if (!params?.accountId) {
          return NextResponse.json({
            success: false,
            error: 'accountId is required',
          }, { status: 400 });
        }
        if (!params?.dataTypes) {
          return NextResponse.json({
            success: false,
            error: 'dataTypes is required (can be a single string or array of strings)',
          }, { status: 400 });
        }
        result = await crmDbTools.getExternalObjectsByDataType(
          params.accountId,
          params.dataTypes,
          params.limit || 20
        );
        break;

      case 'getExternalObjectStatsByDataType':
        if (!params?.accountId) {
          return NextResponse.json({
            success: false,
            error: 'accountId is required',
          }, { status: 400 });
        }
        result = await crmDbTools.getExternalObjectStatsByDataType(params.accountId);
        break;

      case 'getFirst10Accounts':
        result = await crmDbTools.getFirst10Accounts();
        break;

      case 'getExternalObjectsForCustomer':
        if (!params?.accountId) {
          return NextResponse.json({
            success: false,
            error: 'accountId is required',
          }, { status: 400 });
        }
        result = await crmDbTools.getExternalObjectsForCustomer(
          params.accountId,
          params.limit || 10
        );
        break;

      case 'getRandom10Accounts':
        result = await crmDbTools.getRandom10Accounts();
        break;

      case 'searchAccountsByIntegrationsId':
        if (!params?.integrationsCustomerId) {
          return NextResponse.json({
            success: false,
            error: 'integrationsCustomerId is required',
          }, { status: 400 });
        }
        result = await crmDbTools.searchAccountsByIntegrationsId(
          params.integrationsCustomerId,
          { limit: params.limit || 25, skip: params.skip || 0 }
        );
        break;

      case 'getAccountById':
        if (!params?.id) {
          return NextResponse.json({
            success: false,
            error: 'id is required',
          }, { status: 400 });
        }
        result = await crmDbTools.getAccountById(params.id);
        break;

      case 'getAccountByName':
        if (!params?.nameQuery) {
          return NextResponse.json({
            success: false,
            error: 'nameQuery is required',
          }, { status: 400 });
        }
        result = await crmDbTools.getAccountByName(
          params.nameQuery,
          { limit: params.limit || 25, skip: params.skip || 0 }
        );
        break;

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown function: ${functionName}`,
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      database: 'CRM',
      function: functionName,
      params,
      result,
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

