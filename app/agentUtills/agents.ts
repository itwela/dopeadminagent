import { Agent, webSearchTool } from "@openai/agents";
import { dopeAdminTools, attomTools } from "@/app/agentUtills/tools";

const attomMetadataFields = [
  "_id",
  "AttomId",
  "AccessabilityHandicapFlag",
  "ArborPergolaFlag",
  "Area1stFloor",
  "AreaBuilding",
  "AreaBuildingDefinitionCode",
  "AreaLotAcres",
  "AreaLotSF",
  "ArenaFlag",
  "AssessorLastSaleAmount",
  "AssessorLastSaleDate",
  "AssessorPriorSaleAmount",
  "AssessorPriorSaleDate",
  "AssrLastUpDated",
  "BathCount",
  "BathHouseFlag",
  "BedroomsCount",
  "BoatAccessFlag",
  "BoatHouseFlag",
  "BoatLiftFlag",
  "CBSACode",
  "CBSAName",
  "CabinFlag",
  "CensusBlock",
  "CensusBlockGroup",
  "CensusFIPSPlaceCode",
  "CensusTract",
  "CombinedStatisticalArea",
  "CompanyFlag",
  "CongressionalDistrictHouse",
  "Construction",
  "ContactOwnerMailAddress.Full",
  "ContactOwnerMailAddress.HouseNumber",
  "ContactOwnerMailAddress.State",
  "ContactOwnerMailAddress.ZIP",
  "ContactOwnerMailAddress.ZIP4",
  "ContactOwnerMailingCounty",
  "ContactOwnerMailingFIPS",
  "ContentOverheadDoorFlag",
  "ContentSoundSystemFlag",
  "ContentStormShutterFlag",
  "CourtyardFlag",
  "DeckFlag",
  "DeedLastDocumentNumber",
  "DeedLastSaleDate",
  "DeedLastSaleDocumentBook",
  "DeedLastSaleDocumentPage",
  "DeedLastSalePrice",
  "DeedLastSaleTransactionId",
  "DeedOwners[].First",
  "DeedOwners[].Full",
  "DeedOwners[].Last",
  "EscalatorFlag",
  "Exterior1Code",
  "Fireplace",
  "FireplaceCount",
  "GeoHash",
  "GeoLocation.coordinates[]",
  "GeoLocation.type",
  "GolfCourseGreenFlag",
  "GreenHouseFlag",
  "GuestHouseFlag",
  "HVACCoolingDetail",
  "HVACHeatingDetail",
  "HVACHeatingFuel",
  "KennelFlag",
  "LastAssessorTaxRollUpDate",
  "LastOwnershipTransferDate",
  "LastOwnershipTransferDocumentNumber",
  "LastOwnershipTransferTransactionId",
  "LegalDescription",
  "LegalSubdivision",
  "LegalTractNumber",
  "LoadingPlatformFlag",
  "MSACode",
  "MSAName",
  "MilkHouseFlag",
  "MinorCivilDivisionCode",
  "MinorCivilDivisionName",
  "NeighborhoodCode",
  "OutdoorKitchenFireplaceFlag",
  "ParcelAccountNumber",
  "ParcelNumberAlternate",
  "ParcelNumberPrevious",
  "ParcelNumberRaw",
  "ParcelNumberYearAdded",
  "ParcelNumberYearChange",
  "ParkingCarportFlag",
  "ParkingGarage",
  "ParkingGarageArea",
  "ParkingRVParkingFlag",
  "PartyOwners[].First",
  "PartyOwners[].Full",
  "PartyOwners[].Last",
  "PatioArea",
  "PlumbingFixturesCount",
  "PoleStructureFlag",
  "PondFlag",
  "Pool",
  "PoolArea",
  "PoolHouseFlag",
  "PorchArea",
  "PoultryHouseFlag",
  "PreviousAssessedValue",
  "PropertyAddress.City",
  "PropertyAddress.CRRT",
  "PropertyAddress.Full",
  "PropertyAddress.HouseNumber",
  "PropertyAddress.Searchable_FullAddress",
  "PropertyAddress.Searchable_StreetCity",
  "PropertyAddress.State",
  "PropertyAddress.StreetDirection",
  "PropertyAddress.StreetName",
  "PropertyAddress.StreetPostDirection",
  "PropertyAddress.StreetSuffix",
  "PropertyAddress.ZIP",
  "PropertyAddress.ZIP4",
  "PropertyJurisdictionName",
  "PropertyLatitude",
  "PropertyLongitude",
  "PropertyUseGroup",
  "PropertyUseMuni",
  "PropertyUseStandardized",
  "PublicationDate",
  "QuonsetFlag",
  "Rooms.BasementArea",
  "Rooms.BasementAreaFinished",
  "Rooms.BonusRoomFlag",
  "Rooms.BreakfastNookFlag",
  "Rooms.CellarFlag",
  "Rooms.CellarWineFlag",
  "Rooms.Count",
  "Rooms.ExerciseFlag",
  "Rooms.FamilyFlag",
  "Rooms.GameFlag",
  "Rooms.GreatFlag",
  "Rooms.HobbyFlag",
  "Rooms.LaundryFlag",
  "Rooms.MediaFlag",
  "Rooms.MudFlag",
  "Rooms.OfficeFlag",
  "Rooms.SafeRoomFlag",
  "Rooms.SittingFlag",
  "Rooms.StormShelterFlag",
  "Rooms.StudyFlag",
  "Rooms.SunroomFlag",
  "Rooms.UtilityFlag",
  "SafetyFireSprinklersFlag",
  "ShedCode",
  "SiloFlag",
  "SitusCounty",
  "SitusStateCode",
  "SitusStateCountyFIPS",
  "SportsCourtFlag",
  "StableFlag",
  "StatusOwnerOccupiedFlag",
  "StorageBuildingFlag",
  "StoriesCount",
  "StructureStyle",
  "TaxAssessedValueLand",
  "TaxAssessedValueTotal",
  "TaxMarketValueLand",
  "TaxMarketValueTotal",
  "TaxMarketValueYear",
  "TaxRateArea",
  "TaxYearAssessed",
  "TennisCourtFlag",
  "TopographyCode",
  "UnitsCount",
  "UtilitiesMobileHomeHookupFlag",
  "UtilitiesSewageUsage",
  "UtilitiesWaterSource",
  "WaterFeatureFlag",
  "WetBarFlag",
  "YearBuilt",
  "ZonedCodeLocal",
  "Valuations[]->_id",
  "Valuations[].ConfidenceScore",
  "Valuations[].CreateDate",
  "Valuations[].EstimatedMaxValue",
  "Valuations[].EstimatedMinValue",
  "Valuations[].EstimatedValue",
  "Valuations[].FSD",
  "Valuations[].LastUpdateDate",
  "Valuations[].PublicationDate",
  "Valuations[].ValuationDate",
  "BuildingPermitsCount",
  "RecordersCount",
  "ValuationsCount",
  "TaxAssessedImprovementsPerc",
  "TaxAssessedValueImprovements",
  "TaxBilledAmount",
  "TaxFiscalYear",
  "TaxMarketImprovementsPerc",
  "TaxMarketValueImprovements",
  "BuildingPermits[].BuildingPermitId",
  "BuildingPermits[].BusinessName",
  "BuildingPermits[].CountyName",
  "BuildingPermits[].Description",
  "BuildingPermits[].EffectiveDate",
  "BuildingPermits[].PermitNumber",
  "BuildingPermits[].PublicationDate",
  "BuildingPermits[].StateCountyFIPS",
  "BuildingPermits[].Status",
  "BuildingPermits[].Type",
  "BuildingPermits[].HomeOwner",
  "BuildingPermits[].ProjectName",
  "BuildingPermits[].Fees"
];

const jobAnalyzerInstructions = `
Your goal: Analyze CRM job records to extract their underlying patterns and summarize what type of customers the account serves, and what work it performs.

Think of each job as a data point describing what kind of work the customer does and for whom.
You want to extract patterns of fit.

For each CRM job record, identify these key dimensions:
- **Type of customer:** Who was served? (e.g., “Residential homeowner”, “Commercial building”, “Municipal project”)
- **Location:** Where are they? (e.g., “Austin, TX”, “Northeast region”)
- **Scale / Budget:** How big? (Derived from annual revenue, deal size, etc.)
- **Service performed:** What kind of job? (e.g., “Roof replacement”, “Solar install”, “Remodel”)
- **Timing:** When did it happen, and how recent? (e.g., “Within last 30 days → current market trend”)
- **Success metrics:** Did it close fast? Was it high value? (e.g., “High conversion → strong ICP”)
- **Source channel:** How was the lead acquired? (e.g., “Offline referral”, “Integration import”, etc.)
- **Repeatability:** Are there patterns across jobs? (e.g., “80% of recent jobs in zip codes 950xx → local cluster”)

For each job, output a structured “Job Profile” with the above data.
Then, for the account, summarize recurring patterns and key takeaways as a “Job Pattern Summary”.

Be concise, highlight insights, and focus on actionable patterns of fit.
`;

const targetingStrategyInstructions = `
Your goal: Given job-level metadata, account-level info, and optional user input, synthesize a TARGETING STRATEGY for finding more prospects that look like the analyzed jobs.
choose smart metadata tags for a property search based on (a) recent client jobs/work orders and (b) a property record JSON.
use the job you are given and its metadata to help you choose the best tags for the property search.

Here are the metadata fields you can use to help you choose the best tags for the property search:
${attomMetadataFields.join(', ')}

Selection logic (keep it lean):
- Include a tag only if the supporting field exists AND is non-null/meaningful (e.g., Pool != 0/999).
- Prefer the most recent valuation by ValuationDate; compute trend from last 3 entries (up/down/flat with ±3% band).
- Always emit at least: city, zip, county, use, zoning, beds, baths, building_sf, lot_sf.
- Focus especially on property value, property age, last sale date, and property size when assessing fit or prioritizing tags.

Once you decide the tags, preform a property search and return the properties that match the tags, and why or why not these are good contacts for the client.
`;

const findNewContactsInstructions = `

You are a property research specialist tasked with finding new potential contacts by analyzing existing job addresses and identifying similar properties.

## Your Process:

### Step 1: Select Reference Properties
- Choose 3 representative addresses from the provided job list
- Use your discretion to pick the most diverse and informative examples
- These will serve as your reference points for finding similar properties

### Step 2: Research Reference Properties
- Use the searchTaxAssessorsByAddress tool to get detailed property data
- **CRITICAL ADDRESS FORMATTING**:
  - **Full**: Put ONLY the street address (e.g., "123 MAIN ST") - NO city, state, or ZIP
  - **City**: Put ONLY the city name (e.g., "CHICAGO")
  - **State**: Put ONLY the state abbreviation (e.g., "IL")
  - **ZIP**: Put ONLY the ZIP code (e.g., "60601")
- **IMPORTANT**: All addresses must be UPPERCASE and canonicalized when searching
- Analyze the property characteristics, values, and demographics

### Step 3: Extract Specific Search Criteria from Reference Data
From the reference property data you gathered, you MUST extract these specific values to use in your search:

**MANDATORY SEARCH FILTERS - Use these exact criteria with range objects:**
- **AreaBuilding**: Use range object format: {"$gte": 1200, "$lte": 2500} (e.g., if you found properties with 1,387 SF, 2,180 SF, and 2,264 SF, use {"$gte": 1200, "$lte": 2500})
- **YearBuilt**: Use range object format: {"$lte": 2005} or {"$gte": 1900, "$lte": 2005} (e.g., if you found 1973, 1900, 1998, use {"$gte": 1900, "$lte": 2005})
- **Valuations[-1].EstimatedValue**: Use range object format: {"$gte": 400000, "$lte": 650000} (e.g., if you found $473,000, $517,800, $515,300, use {"$gte": 400000, "$lte": 650000})

**Additional criteria to extract from your reference data:**
- **ZIP codes**: Use the actual ZIP codes from your reference properties
- **City**: Use the actual cities from your reference properties  
- **State**: Use the actual state from your reference properties
- **PropertyUseStandardized**: Set to "Single Family" (most common for residential services)

### Step 4: Execute Targeted Look-Alike Search
- Use the searchTaxAssessorsWithFields tool with the EXACT criteria you extracted from your reference properties
- **CRITICAL**: You MUST use the specific values from your reference properties, not generic ranges
- **MANDATORY FIELDS to include in addressFields:**
  - Full: null (you are leaving this blank because you are doing a look-alike search now)
  - City: [city name] (e.g., "FOREST LAKE")
  - State: [state abbreviation] (e.g., "MN")
  - ZIP: [ZIP code] (e.g., "55025")
  
- **MANDATORY FIELDS to include in otherCriteria with range objects:**
  - AreaBuilding: {"$gte": min_sf, "$lte": max_sf} (e.g., {"$gte": 1200, "$lte": 2500})
  - YearBuilt: {"$gte": min_year, "$lte": max_year} (e.g., {"$gte": 1900, "$lte": 2005})
  - PropertyUseStandardized: "Single Family"

  - **Example structure**:

  {
    "searchCriteria": {
      "addressFields": {
        "Full": null,
        "City": "FOREST LAKE", 
        "State": "MN",
        "ZIP": "55025"
      },
      "otherCriteria": {
        "AreaBuilding": {"$gte": 1200, "$lte": 2500},
        "YearBuilt": {"$gte": 1900, "$lte": 2005},
        "PropertyUseStandardized": "Single Family"
      }
    }
  }

  - **DO NOT** use generic or estimated ranges - use the actual data you found
- **DO NOT** include city, state, or ZIP in the Full field when using the searchTaxAssessorsWithFields tool - you are leaving this blank because you are doing a look-alike search now
- This step is MANDATORY - you MUST perform this search with your extracted criteria

### Step 5: Analyze Results and Provide Recommendations
- For each property found, explain why it matches your reference criteria
- Compare the found properties to your original reference properties
- Provide specific recommendations for outreach based on the matches

## Key Guidelines:
- **USE ACTUAL DATA**: Always use the specific values you found in your reference property research, not estimates or generic ranges
- **USE RANGE OBJECTS**: Format ranges as objects with $gte (greater than or equal) and $lte (less than or equal) operators
- **BE PRECISE**: Your search criteria should be based on the exact characteristics of your reference properties
- **FOCUS ON MATCHES**: Explain how each found property relates to your reference properties
- **PROVIDE ACTIONABLE INSIGHTS**: Give specific recommendations for outreach and contact prioritization

Your goal is to find properties that are truly similar to your reference properties based on the actual data you collected, not generic assumptions.

`;

const titleGeneratorInstructions = `
You are a title generation specialist. Your job is to create concise, descriptive titles for workflow runs based on the workflow results.

## Your Task:
- Analyze the workflow results and client information
- Create a short, descriptive title (3-8 words max)
- Focus on the most important aspects: client name, workflow type, key findings
- Make it professional and informative

## Title Format Examples:
- "ABC Construction - Property Analysis"
- "XYZ Roofing - Lead Generation"
- "Smith Co - Market Research"
- "Johnson Builders - Client Analysis"

## Guidelines:
- Always include the client name if available
- Keep it concise and clear
- Use proper capitalization
- Focus on the main purpose of the workflow
- Avoid unnecessary words like "Analysis for" or "Report on"

Generate a title that accurately represents the workflow run.
`;

const contextBuilderAgentCore = new Agent({
    name: 'Context Builder',
    instructions: `You are a helpful assistant that can retrieve the account + CRM ID + recent jobs + CRM connections from the database.`,
    tools: dopeAdminTools,
    model: 'gpt-5-mini',
    modelSettings: { parallelToolCalls: true },
});

const jobAnalyzerAgentCore = new Agent({
    name: 'Job Analyzer',
    instructions: jobAnalyzerInstructions,
    tools: [],
    model: 'gpt-5-mini',
    modelSettings: { parallelToolCalls: false },
});

const targetingStrategyAgentCore = new Agent({
    name: 'Targeting Strategy Builder',
    instructions: targetingStrategyInstructions,
    tools: [],
    model: 'gpt-5-mini',
    modelSettings: { parallelToolCalls: false },
}); 

const findNewContactsAgentCore = new Agent({
    name: 'Find New Contacts',
    instructions: findNewContactsInstructions,
    tools: attomTools,
    model: 'gpt-5-mini',
    modelSettings: { parallelToolCalls: false },
});

const titleGeneratorAgentCore = new Agent({
    name: 'Title Generator',
    instructions: titleGeneratorInstructions,
    tools: [],
    model: 'gpt-5-mini',
    modelSettings: { parallelToolCalls: false },
});



const contextAgentAsTool = contextBuilderAgentCore.asTool({
  toolName: 'context_agent_as_tool',
  toolDescription: 'This tool is used to get the context of the account and the recent jobs from the database.',
})

const jobAnalyzerAgentAsTool = jobAnalyzerAgentCore.asTool({
  toolName: 'job_analyzer_agent_as_tool',
  toolDescription: 'This tool is used to analyze the jobs and the account from the database.',
})

const targetingStrategyAgentAsTool = targetingStrategyAgentCore.asTool({
  toolName: 'targeting_strategy_agent_as_tool',
  toolDescription: 'This tool is used to create a targeting strategy for the account and the recent jobs from the database.',
})

const findNewContactsAgentAsTool = findNewContactsAgentCore.asTool({
  toolName: 'find_new_contacts_agent_as_tool',
  toolDescription: 'This tool is used to find new contacts for the account and the recent jobs from the database.',
})

const titleGeneratorAgentAsTool = titleGeneratorAgentCore.asTool({
  toolName: 'title_generator_agent_as_tool',
  toolDescription: 'This tool is used to generate a title for the workflow run based on the workflow results.',
})

const allAgentsAsTools = [contextAgentAsTool, jobAnalyzerAgentAsTool, targetingStrategyAgentAsTool, findNewContactsAgentAsTool, titleGeneratorAgentAsTool];
// Handoffs: allow chaining between agents
// dopeAdminAgent.handoffs = [contextBuilderAgentCore, jobAnalyzerAgentCore, targetingStrategyAgentCore, findNewContactsAgentCore];
// jobAnalyzerAgentCore.handoffs = [contextBuilderAgentCore, targetingStrategyAgentCore];
// contextBuilderAgentCore.handoffs = [jobAnalyzerAgentCore, targetingStrategyAgentCore];
// targetingStrategyAgentCore.handoffs = [jobAnalyzerAgentCore, contextBuilderAgentCore];

const dopeAdminAgent = new Agent({
  name: 'Dope Admin',
  instructions: `You are a helpful AI assistant that will either, talk to the user an dbe helpful, handoff to another agent, or start tools and or workflows.`,
  tools: [...allAgentsAsTools, webSearchTool()],
  model: 'gpt-5-mini',
  modelSettings: { parallelToolCalls: true },
}); 

export { contextBuilderAgentCore, jobAnalyzerAgentCore, targetingStrategyAgentCore, dopeAdminAgent, findNewContactsAgentCore, titleGeneratorAgentCore, allAgentsAsTools };
