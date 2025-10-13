import { NextResponse } from 'next/server';
import { dopeCoreDbTools } from '@/lib/dope-core-db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { function: functionName, params } = body;

    let result;

    switch (functionName) {
      case 'listTables':
        result = await dopeCoreDbTools.listTables();
        break;

      case 'getTableSchema':
        if (!params?.tableName) {
          return NextResponse.json({
            success: false,
            error: 'tableName is required',
          }, { status: 400 });
        }
        result = await dopeCoreDbTools.getTableSchema(params.tableName);
        break;

      case 'executeSelect':
        if (!params?.query) {
          return NextResponse.json({
            success: false,
            error: 'query is required',
          }, { status: 400 });
        }
        result = await dopeCoreDbTools.executeSelect(params.query);
        break;

      case 'countRows':
        if (!params?.tableName) {
          return NextResponse.json({
            success: false,
            error: 'tableName is required',
          }, { status: 400 });
        }
        result = await dopeCoreDbTools.countRows(
          params.tableName,
          params.whereClause,
        );
        break;

      case 'getRecentRows':
        if (!params?.tableName) {
          return NextResponse.json({
            success: false,
            error: 'tableName is required',
          }, { status: 400 });
        }
        result = await dopeCoreDbTools.getRecentRows(
          params.tableName,
          params.limit || 10,
          params.orderByColumn || 'created_at',
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
      database: 'Dope Core',
      function: functionName,
      params,
      result,
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
    }, { status: 500 });
  }
}

