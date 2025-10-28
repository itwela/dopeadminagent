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

      case 'getRecentTaxAssessors':
        result = await attomDbTools.getRecentTaxAssessors(
          params?.limit || 10
        );
        break;

      case 'searchTaxAssessorsByAddress':
        if (!params?.addressFields) {
          return NextResponse.json({
            success: false,
            error: 'addressFields is required',
          }, { status: 400 });
        }
        result = await attomDbTools.searchTaxAssessorsByAddress(
          params.addressFields,
          params?.limit || 10
        );
        break;

      case 'getTaxAssessorsByCity':
        if (!params?.city) {
          return NextResponse.json({
            success: false,
            error: 'city is required',
          }, { status: 400 });
        }
        result = await attomDbTools.getTaxAssessorsByCity(
          params.city,
          params?.limit || 10
        );
        break;

      case 'getTaxAssessorsByZIP':
        if (!params?.zip) {
          return NextResponse.json({
            success: false,
            error: 'zip is required',
          }, { status: 400 });
        }
        result = await attomDbTools.getTaxAssessorsByZIP(
          params.zip,
          params?.limit || 10
        );
        break;

      case 'getTaxAssessorsByState':
        if (!params?.state) {
          return NextResponse.json({
            success: false,
            error: 'state is required',
          }, { status: 400 });
        }
        result = await attomDbTools.getTaxAssessorsByState(
          params.state,
          params?.limit || 10
        );
        break;

      case 'getTaxAssessorsDataSources':
        result = await attomDbTools.getTaxAssessorsDataSources(
          params?.limit || 10
        );
        break;

      case 'searchTaxAssessorsLookupByCity':
        if (!params?.city) {
          return NextResponse.json({
            success: false,
            error: 'city is required',
          }, { status: 400 });
        }
        result = await attomDbTools.searchTaxAssessorsLookupByCity(
          params.city,
          params?.limit || 10
        );
        break;

      case 'searchTaxAssessorsLookupByZIP':
        if (!params?.zip) {
          return NextResponse.json({
            success: false,
            error: 'zip is required',
          }, { status: 400 });
        }
        result = await attomDbTools.searchTaxAssessorsLookupByZIP(
          params.zip,
          params?.limit || 10
        );
        break;

      case 'searchTaxAssessorsLookupByState':
        if (!params?.state) {
          return NextResponse.json({
            success: false,
            error: 'state is required',
          }, { status: 400 });
        }
        result = await attomDbTools.searchTaxAssessorsLookupByState(
          params.state,
          params?.limit || 10
        );
        break;

      case 'getAttomSettings':
        result = await attomDbTools.getAttomSettings();
        break;

      case 'getAttomFiles':
        result = await attomDbTools.getAttomFiles(
          params?.limit || 10
        );
        break;

      case 'searchTaxAssessorsSearchAddresses':
        if (!params?.addressQuery) {
          return NextResponse.json({
            success: false,
            error: 'addressQuery is required',
          }, { status: 400 });
        }
        result = await attomDbTools.searchTaxAssessorsSearchAddresses(
          params.addressQuery,
          params?.limit || 10
        );
        break;

      case 'getFieldMetadata':
        result = await attomDbTools.getFieldMetadata(
          params?.collectionName
        );
        break;

      case 'searchFieldInMetadata':
        if (!params?.fieldName) {
          return NextResponse.json({
            success: false,
            error: 'fieldName is required',
          }, { status: 400 });
        }
        result = await attomDbTools.searchFieldInMetadata(
          params.fieldName,
          params?.collectionName
        );
        break;

      case 'getAllFieldNames':
        result = await attomDbTools.getAllFieldNames(
          params?.collectionName
        );
        break;

      case 'getDistinctCities':
        result = await attomDbTools.getDistinctCities(
          params?.limit || 50
        );
        break;

      case 'getDistinctStates':
        result = await attomDbTools.getDistinctStates();
        break;

      case 'getDistinctZIPs':
        result = await attomDbTools.getDistinctZIPs(
          params?.limit || 100
        );
        break;

      case 'searchPropertiesByMetadata':
        if (!params?.criteria) {
          return NextResponse.json({
            success: false,
            error: 'criteria is required',
          }, { status: 400 });
        }
        result = await attomDbTools.searchPropertiesByMetadata(params.criteria);
        break;

      case 'searchPropertiesWithFlags':
        if (!params?.location || !params?.flags) {
          return NextResponse.json({
            success: false,
            error: 'location and flags are required',
          }, { status: 400 });
        }
        result = await attomDbTools.searchPropertiesWithFlags(
          params.location,
          params.flags,
          params?.limit || 10
        );
        break;

      case 'searchPropertiesWithNumericCriteria':
        if (!params?.location || !params?.numericCriteria) {
          return NextResponse.json({
            success: false,
            error: 'location and numericCriteria are required',
          }, { status: 400 });
        }
        result = await attomDbTools.searchPropertiesWithNumericCriteria(
          params.location,
          params.numericCriteria,
          params?.limit || 10
        );
        break;

      case 'getPropertyStats':
        if (!params?.location) {
          return NextResponse.json({
            success: false,
            error: 'location is required',
          }, { status: 400 });
        }
        result = await attomDbTools.getPropertyStats(
          params.location,
          params?.fields || []
        );
        break;

      case 'searchTaxAssessorsWithFields':
        result = await attomDbTools.searchTaxAssessorsWithFields(
          params?.searchCriteria || {},
          params?.options || {}
        );
        break;

      case 'searchTaxAssessorsByCoordinates':
        if (!params?.coordinates || !params.coordinates.latitude || !params.coordinates.longitude) {
          return NextResponse.json({
            success: false,
            error: 'coordinates with latitude and longitude are required',
          }, { status: 400 });
        }
        result = await attomDbTools.searchTaxAssessorsByCoordinates(
          params.coordinates,
          params?.limit || 10
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

