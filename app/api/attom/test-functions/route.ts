import { NextResponse } from 'next/server';
import { attomDbTools } from '@/lib/attom-db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { function: functionName, params } = body;

    let result;

    switch (functionName) {
      case 'listCollections':
        result = await attomDbTools.listCollections();
        break;

      case 'getCollectionInfo':
        if (!params?.collectionName) {
          return NextResponse.json({
            success: false,
            error: 'collectionName is required',
          }, { status: 400 });
        }
        result = await attomDbTools.getCollectionInfo(params.collectionName);
        break;

      case 'executeFind':
        if (!params?.collectionName) {
          return NextResponse.json({
            success: false,
            error: 'collectionName is required',
          }, { status: 400 });
        }
        result = await attomDbTools.executeFind(
          params.collectionName,
          params.query || {},
          params.options || {}
        );
        break;

      case 'countDocuments':
        if (!params?.collectionName) {
          return NextResponse.json({
            success: false,
            error: 'collectionName is required',
          }, { status: 400 });
        }
        result = await attomDbTools.countDocuments(
          params.collectionName,
          params.query || {}
        );
        break;

      case 'getRecentDocuments':
        if (!params?.collectionName) {
          return NextResponse.json({
            success: false,
            error: 'collectionName is required',
          }, { status: 400 });
        }
        result = await attomDbTools.getRecentDocuments(
          params.collectionName,
          params.limit || 10,
          params.sortField || '_id'
        );
        break;

      case 'executeAggregation':
        if (!params?.collectionName || !params?.pipeline) {
          return NextResponse.json({
            success: false,
            error: 'collectionName and pipeline are required',
          }, { status: 400 });
        }
        result = await attomDbTools.executeAggregation(
          params.collectionName,
          params.pipeline
        );
        break;

      case 'getDistinctValues':
        if (!params?.collectionName || !params?.field) {
          return NextResponse.json({
            success: false,
            error: 'collectionName and field are required',
          }, { status: 400 });
        }
        result = await attomDbTools.getDistinctValues(
          params.collectionName,
          params.field,
          params.query || {}
        );
        break;

      case 'getIndexes':
        if (!params?.collectionName) {
          return NextResponse.json({
            success: false,
            error: 'collectionName is required',
          }, { status: 400 });
        }
        result = await attomDbTools.getIndexes(params.collectionName);
        break;

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown function: ${functionName}`,
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      database: 'ATTOM (TaxAssessors)',
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

