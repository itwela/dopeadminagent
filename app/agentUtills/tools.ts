import { attomDbTools } from "@/lib/attom-db";
import { crmDbTools } from "@/lib/crm-db";
import { dopeCoreDbTools } from "@/lib/dope-core-db";
import {
    tool
} from "@openai/agents";
import z from "zod";

const searchDopeCoreForAccount = tool({
    name: 'searchDopeCoreForAccount',
    description: 'Search the Dope Core database for an account and then find matching CRM account',
    parameters: z.object({
        name: z.string().describe('The name of the account to search for'),
    }),
    execute: async (input) => {
        const { name } = input;
        
        // Step 1: Search Dope Core for the account and get integrations_customer_id
        const dopeCoreResults = await dopeCoreDbTools.getIntegrationsCustomerIdByName(name);
        
        if (!dopeCoreResults || dopeCoreResults.length === 0) {
            return {
                success: false,
                message: `No account found in Dope Core with name containing "${name}"`,
                dopeCoreResults: [],
                crmResults: []
            };
        }
        
        // Step 2: For each Dope Core result, search CRM for matching integrations_customer_id
        const crmResults: Array<{ dopeCoreAccount: any; crmAccount: any | null }> = [];
        for (const dopeAccount of dopeCoreResults) {
            if (dopeAccount?.integrations_customer_id) {
                const crmAccount = await crmDbTools.getAccountById(
                    dopeAccount.integrations_customer_id
                );
                crmResults.push({
                    dopeCoreAccount: dopeAccount,
                    crmAccount,
                });
            }
        }

        // Step 3: Get recent jobs for the first matched CRM account (if any)
        let recentJobsResults: any[] = [];
        const firstCrmAccount = crmResults.find(r => r.crmAccount)?.crmAccount;
        if (firstCrmAccount && firstCrmAccount._id) {
            const jobs = await crmDbTools.getExternalObjectsForCustomer(String(firstCrmAccount._id));
            recentJobsResults = jobs?.results ?? [];
        }
        
        return {
            success: true,
            message: `Found ${dopeCoreResults.length} Dope Core account(s) and ${crmResults.length} CRM match(es) and ${recentJobsResults.length} recent jobs`,
            dopeCoreResults: dopeCoreResults || [],
            crmResults: crmResults || [],
            recentJobs: recentJobsResults
        };

    },
});

const getCrmConnectionsForAccount = tool({
    name: 'getCrmConnectionsForAccount',
    description: 'Get CRM connections for a specific account ID. the "dataSource" field in the results is the name of the integration or data source that the connection is for.',
    parameters: z.object({
        accountId: z.string().describe('The CRM account ID to get connections for'),
    }),
    execute: async (input) => {
        const { accountId } = input;
        
        try {
            const connections = await crmDbTools.getConnectionsForCustomer(accountId, 20);
            
            return {
                success: true,
                message: `Found ${connections.length} connections for account ${accountId}`,
                connections,
                accountId
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Failed to get connections for account ${accountId}: ${error.message}`,
                connections: [],
                accountId
            };
        }
    },
});


const searchTaxAssessorsByAddress = tool({
    name: 'searchTaxAssessorsByAddress',
    description: 'Search ATTOM property database by address. Addresses must be uppercase canonicalized when searching.',
    parameters: z.object({
        addressFields: z.object({
            Full: z.string().describe('Full address string MINUS CITY, STATE, AND ZIP'),
            City: z.string().optional().nullable().describe('City name'),
            State: z.string().optional().nullable().describe('State abbreviation'),
            ZIP: z.string().optional().nullable().describe('ZIP code'),
            HouseNumber: z.string().optional().nullable().describe('House number'),
            StreetName: z.string().optional().nullable().describe('Street name'),
            StreetPostDirection: z.string().optional().nullable().describe('Street post direction (N, S, E, W)'),
            StreetSuffix: z.string().optional().nullable().describe('Street suffix (St, Ave, Blvd, etc.)'),
            Searchable_FullAddress: z.string().optional().nullable().describe('Searchable full address'),
            Searchable_StreetCity: z.string().optional().nullable().describe('Searchable street and city')
        }).describe('Address fields to search by'),
        limit: z.number().optional().nullable().default(10).describe('Maximum number of results to return')
    }),
    execute: async (input) => {
        const { addressFields, limit = 10 } = input;
        // Convert null values to undefined for compatibility with ATTOM functions
        const cleanAddressFields = {
            Full: addressFields.Full || undefined,
            City: addressFields.City || undefined,
            State: addressFields.State || undefined,
            ZIP: addressFields.ZIP || undefined,
            HouseNumber: addressFields.HouseNumber || undefined,
            StreetName: addressFields.StreetName || undefined,
            StreetPostDirection: addressFields.StreetPostDirection || undefined,
            StreetSuffix: addressFields.StreetSuffix || undefined,
            Searchable_FullAddress: addressFields.Searchable_FullAddress || undefined,
            Searchable_StreetCity: addressFields.Searchable_StreetCity || undefined
        };
        
        return await attomDbTools.searchTaxAssessorsByAddress(cleanAddressFields, limit || 10);
    },
});

const searchTaxAssessorsWithFields = tool({
    name: 'searchTaxAssessorsWithFields',
    description: 'Search ATTOM property database with custom field selection and criteria. Use this for finding look-alike properties based on specific criteria from previous searches.',
    parameters: z.object({
        searchCriteria: z.object({
            addressFields: z.object({
                Full: z.string().describe('Full address string MINUS CITY, STATE, AND ZIP'),
                City: z.string().optional().nullable(),
                State: z.string().optional().nullable(),
                ZIP: z.string().optional().nullable(),
                // HouseNumber: z.string().optional().nullable(),
                // StreetName: z.string().optional().nullable(),
                // StreetPostDirection: z.string().optional().nullable(),
                // StreetSuffix: z.string().optional().nullable(),
                // Searchable_FullAddress: z.string().optional().nullable(),
                // Searchable_StreetCity: z.string().optional().nullable()
            }).describe('Address fields to search by'),
            // }).optional().nullable().describe('Address fields to search by'),
            otherCriteria: z.object({
                AreaBuilding: z.union([
                    z.number().describe('Exact area in square feet'),
                    z.object({
                        $gte: z.number().describe('Minimum area in square feet'),
                        $lte: z.number().describe('Maximum area in square feet')
                    }).describe('Area range (min to max)')
                ]).optional().nullable().describe('Building area criteria - use exact number or range object with $gte/$lte'),
                YearBuilt: z.union([
                    z.number().describe('Exact year built'),
                    z.object({
                        $gte: z.number().describe('Minimum year built'),
                        $lte: z.number().describe('Maximum year built')
                    }).describe('Year built range (min to max)')
                ]).optional().nullable().describe('Year built criteria - use exact number or range object with $gte/$lte'),
            }).describe('Other search criteria with support for ranges and arrays')
        }).describe('Search criteria including address and other property fields'),
        options: z.object({
            fields: z.array(z.string()).optional().nullable().describe('Array of field names to return'),
            limit: z.number().optional().nullable().default(10).describe('Maximum number of results to return'),
            skip: z.number().optional().nullable().default(0).describe('Number of results to skip'),
            sort: z.record(z.union([z.literal(1), z.literal(-1)])).optional().nullable().describe('Sort criteria')
        }).optional().nullable().default({})
    }),
    execute: async (input) => {
        const { searchCriteria, options } = input;
        // Convert null values to undefined for compatibility with ATTOM functions
        const cleanSearchCriteria = {
            addressFields: searchCriteria.addressFields ? {
                Full: searchCriteria.addressFields.Full || undefined,
                City: searchCriteria.addressFields.City || undefined,
                State: searchCriteria.addressFields.State || undefined,
                ZIP: searchCriteria.addressFields.ZIP || undefined,
                // HouseNumber: searchCriteria.addressFields.HouseNumber || undefined,
                // StreetName: searchCriteria.addressFields.StreetName || undefined,
                // StreetPostDirection: searchCriteria.addressFields.StreetPostDirection || undefined,
                // StreetSuffix: searchCriteria.addressFields.StreetSuffix || undefined,
                // Searchable_FullAddress: searchCriteria.addressFields.Searchable_FullAddress || undefined,
                // Searchable_StreetCity: searchCriteria.addressFields.Searchable_StreetCity || undefined
            } : undefined,
            otherCriteria: searchCriteria.otherCriteria || undefined
        };
        
        const cleanOptions = {
            fields: options?.fields || undefined,
            limit: options?.limit || 10,
            skip: options?.skip || 0,
            sort: options?.sort || undefined
        };
        
        return await attomDbTools.searchTaxAssessorsWithFields(cleanSearchCriteria, cleanOptions);
    },
});

const dopeAdminTools = [
    searchDopeCoreForAccount,
    getCrmConnectionsForAccount
];

const attomTools = [
    searchTaxAssessorsByAddress,
    searchTaxAssessorsWithFields
];

//---------------------------------


// Global variable to store the current thread ID for tool execution
// let globalCurrentThreadId: string | null = null;

// Function to set the current thread ID (called from chat API)
export const setCurrentThreadId = (threadId: string | null) => {
    // globalCurrentThreadId = threadId;
    return threadId;
};

//---------------------------------

export { attomTools, dopeAdminTools };
