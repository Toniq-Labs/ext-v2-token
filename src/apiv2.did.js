export default ({ IDL }) => {
  const PrincipalId__1 = IDL.Text;
  const TimeStamp = IDL.Int;
  const LaunchId__2 = IDL.Text;
  const AirDropSaleRequest = IDL.Record({
    'creator_share' : IDL.Bool,
    'creator_share_nft_retained' : IDL.Nat,
    'open_market_place_after_days' : IDL.Nat,
    'is_open_market_place_after_days_custom' : IDL.Bool,
    'launch_date_time' : TimeStamp,
    'type_of_artwork' : IDL.Int,
    'launch_id' : LaunchId__2,
  });
  const AirDropSaleId = IDL.Text;
  const AirDropSaleResponse = IDL.Record({
    'air_drop_sale_id' : AirDropSaleId,
    'updated_at' : TimeStamp,
    'creator_share' : IDL.Bool,
    'created_at' : TimeStamp,
    'creator_share_nft_retained' : IDL.Nat,
    'open_market_place_after_days' : IDL.Nat,
    'is_open_market_place_after_days_custom' : IDL.Bool,
    'launch_date_time' : TimeStamp,
    'type_of_artwork' : IDL.Int,
    'launch_id' : LaunchId__2,
  });
  const Name = IDL.Text;
  const NumberOfMint = IDL.Int;
  const URL = IDL.Text;
  const Price = IDL.Text;
  const AssetId = IDL.Text;
  const LaunchId = IDL.Text;
  const ArtworkRequest = IDL.Record({
    'file_name' : Name,
    'number_of_mint' : NumberOfMint,
    'asset_url' : URL,
    'price' : Price,
    'asset_id' : AssetId,
    'launch_type' : IDL.Text,
    'launch_id' : LaunchId,
  });
  const TimeStamp__1 = IDL.Int;
  const ArtworkId__1 = IDL.Text;
  const ArtworkResponse__1 = IDL.Record({
    'updated_at' : TimeStamp__1,
    'artwork_id' : ArtworkId__1,
    'created_at' : TimeStamp__1,
    'file_name' : Name,
    'number_of_mint' : NumberOfMint,
    'asset_url' : URL,
    'price' : Price,
    'asset_id' : AssetId,
    'launch_type' : IDL.Text,
  });
  const TypeOfArtwork = IDL.Int;
  const BlindSaleRequest = IDL.Record({
    'creator_share' : IDL.Bool,
    'creator_share_nft_retained' : IDL.Nat,
    'open_market_place_after_days' : IDL.Nat,
    'is_open_market_place_after_days_custom' : IDL.Bool,
    'leftovers' : IDL.Text,
    'type_of_artwork' : TypeOfArtwork,
    'launch_id' : LaunchId,
    'number_of_mints' : IDL.Nat,
  });
  const BlindSaleId__2 = IDL.Text;
  const BlindSaleResponse = IDL.Record({
    'updated_at' : TimeStamp__1,
    'creator_share' : IDL.Bool,
    'created_at' : TimeStamp__1,
    'creator_share_nft_retained' : IDL.Nat,
    'blind_sale_id' : BlindSaleId__2,
    'open_market_place_after_days' : IDL.Nat,
    'is_open_market_place_after_days_custom' : IDL.Bool,
    'leftovers' : IDL.Text,
    'type_of_artwork' : TypeOfArtwork,
    'launch_id' : LaunchId,
    'number_of_mints' : IDL.Nat,
  });
  const BlindSaleId__1 = IDL.Text;
  const BulkPricing = IDL.Record({
    'number_of_options' : IDL.Nat,
    'options' : IDL.Vec(IDL.Record({ 'quantity' : IDL.Nat, 'price' : Price })),
  });
  const Name__1 = IDL.Text;
  const BlindSaleId = IDL.Text;
  const PrincipalId = IDL.Text;
  const DscvrWalletListRole = IDL.Record({ 'id' : IDL.Nat, 'name' : IDL.Text });
  const DscvrWalletListForPriceGroupRequest = IDL.Record({
    'portal_name' : IDL.Text,
    'wallet_list' : IDL.Vec(PrincipalId),
    'wallet_list_type' : IDL.Text,
    'launch_id' : LaunchId__2,
    'roles' : IDL.Vec(DscvrWalletListRole),
  });
  const Price__1 = IDL.Text;
  const Id = IDL.Text;
  const BlindSalePriceGroupRequest = IDL.Record({
    'bulk_pricing' : IDL.Opt(BulkPricing),
    'blind_sale_price_group_name' : Name__1,
    'type_of_group' : IDL.Text,
    'individual_wallet_limit' : IDL.Int,
    'blind_sale_id' : BlindSaleId,
    'is_bulk_pricing' : IDL.Bool,
    'dsvr_wallet' : IDL.Opt(DscvrWalletListForPriceGroupRequest),
    'token_indexes' : IDL.Opt(IDL.Vec(IDL.Text)),
    'group_limit' : IDL.Int,
    'price' : Price__1,
    'end_sale_time' : TimeStamp,
    'wallet_addresses' : IDL.Opt(IDL.Vec(Id)),
    'launch_date_time' : TimeStamp,
  });
  const BlindSalePriceGroupId = IDL.Text;
  const DscvrWalletListId = IDL.Text;
  const DscvrWalletListResponse = IDL.Record({
    'updated_at' : TimeStamp,
    'created_at' : TimeStamp,
    'dscvr_wallet_list_id' : DscvrWalletListId,
    'portal_name' : IDL.Text,
    'blind_sale_price_group_id' : IDL.Opt(BlindSalePriceGroupId),
    'wallet_list' : IDL.Vec(PrincipalId),
    'wallet_list_type' : IDL.Text,
    'launch_id' : LaunchId__2,
    'roles' : IDL.Vec(DscvrWalletListRole),
  });
  const BlindSalePriceGroupResponse = IDL.Record({
    'updated_at' : TimeStamp__1,
    'bulk_pricing' : IDL.Opt(BulkPricing),
    'blind_sale_price_group_name' : Name__1,
    'type_of_group' : IDL.Text,
    'individual_wallet_limit' : IDL.Int,
    'created_at' : TimeStamp__1,
    'blind_sale_id' : BlindSaleId,
    'is_bulk_pricing' : IDL.Bool,
    'blind_sale_price_group_id' : BlindSalePriceGroupId,
    'dsvr_wallet' : IDL.Opt(DscvrWalletListResponse),
    'token_indexes' : IDL.Opt(IDL.Vec(IDL.Text)),
    'group_limit' : IDL.Int,
    'price' : Price__1,
    'end_sale_time' : TimeStamp,
    'wallet_addresses' : IDL.Opt(IDL.Vec(Id)),
    'launch_date_time' : TimeStamp,
  });
  const CollectionRequest = IDL.Record({
    'website_url' : URL,
    'creator_name' : Name,
    'nft_receive_address' : IDL.Text,
    'collection_name' : Name,
    'creator_royalty' : IDL.Float64,
    'keywords' : IDL.Text,
    'collection_description' : IDL.Text,
    'collection_brief_description' : IDL.Text,
    'collection_tiny_description' : IDL.Text,
    'royalty_receive_address' : IDL.Text,
    'social_links' : IDL.Record({
      'twitter' : URL,
      'distrikt' : URL,
      'discord' : URL,
      'additional' : IDL.Text,
      'dSCVR' : URL,
      'telegram' : URL,
      'medium' : URL,
    }),
    'images' : IDL.Record({
      'collection_banner_url' : URL,
      'collection_page_image_url' : URL,
      'avatar_url' : URL,
      'homepage_banner_url' : URL,
    }),
  });
  const CreatorId = IDL.Text;
  const AirDropId = IDL.Text;
  const CollectionId = IDL.Text;
  const LaunchResponse = IDL.Record({
    'updated_at' : TimeStamp__1,
    'is_air_drop_nft_enabled' : IDL.Bool,
    'launch_status' : IDL.Text,
    'is_zip_upload' : IDL.Bool,
    'air_drop_id_list' : IDL.Vec(AirDropId),
    'collection_id' : CollectionId,
    'created_at' : TimeStamp__1,
    'metadata_url' : URL,
    'zip_url' : URL,
    'thumbnail_zip_url' : URL,
    'launch_name' : Name,
    'launch_type' : IDL.Text,
    'launch_id' : LaunchId,
  });
  const PrincipalId__2 = IDL.Text;
  const CollectionResponse = IDL.Record({
    'website_url' : URL,
    'updated_at' : TimeStamp__1,
    'creator_name' : Name,
    'creator_id' : CreatorId,
    'launches' : IDL.Vec(LaunchResponse),
    'collection_id' : CollectionId,
    'nft_receive_address' : IDL.Text,
    'created_at' : TimeStamp__1,
    'collection_name' : Name,
    'creator_royalty' : IDL.Float64,
    'keywords' : IDL.Text,
    'collection_description' : IDL.Text,
    'collection_brief_description' : IDL.Text,
    'principal_id' : PrincipalId__2,
    'collection_tiny_description' : IDL.Text,
    'royalty_receive_address' : IDL.Text,
    'social_links' : IDL.Record({
      'twitter' : URL,
      'distrikt' : URL,
      'discord' : URL,
      'additional' : IDL.Text,
      'dSCVR' : URL,
      'telegram' : URL,
      'medium' : URL,
    }),
    'images' : IDL.Record({
      'collection_banner_url' : URL,
      'collection_page_image_url' : URL,
      'avatar_url' : URL,
      'homepage_banner_url' : URL,
    }),
  });
  const DscvrWalletListRequest = IDL.Record({
    'portal_name' : IDL.Text,
    'blind_sale_price_group_id' : IDL.Opt(BlindSalePriceGroupId),
    'wallet_list' : IDL.Vec(PrincipalId),
    'wallet_list_type' : IDL.Text,
    'launch_id' : LaunchId__2,
    'roles' : IDL.Vec(DscvrWalletListRole),
  });
  const LaunchRequest = IDL.Record({
    'is_air_drop_nft_enabled' : IDL.Bool,
    'air_drop_id_list' : IDL.Vec(AirDropId),
    'collection_id' : CollectionId,
    'metadata_url' : URL,
    'thumbnail_zip_url' : URL,
    'launch_name' : Name,
    'launch_type' : IDL.Text,
  });
  const LaunchResponse__1 = IDL.Record({
    'updated_at' : TimeStamp__1,
    'is_air_drop_nft_enabled' : IDL.Bool,
    'launch_status' : IDL.Text,
    'is_zip_upload' : IDL.Bool,
    'air_drop_id_list' : IDL.Vec(AirDropId),
    'collection_id' : CollectionId,
    'created_at' : TimeStamp__1,
    'metadata_url' : URL,
    'zip_url' : URL,
    'thumbnail_zip_url' : URL,
    'launch_name' : Name,
    'launch_type' : IDL.Text,
    'launch_id' : LaunchId,
  });
  const TraitName = IDL.Text;
  const TraitCategoryId__1 = IDL.Text;
  const FileName = IDL.Text;
  const Percentage = IDL.Int;
  const TraitArtworkRequest = IDL.Record({
    'trait_name' : TraitName,
    'trait_category_id' : TraitCategoryId__1,
    'file_name' : FileName,
    'asset_url' : URL,
    'asset_id' : AssetId,
    'percentage' : Percentage,
    'launch_id' : LaunchId,
  });
  const TraitArtworkId = IDL.Text;
  const TraitArtworkResponse__1 = IDL.Record({
    'updated_at' : TimeStamp__1,
    'trait_name' : TraitName,
    'trait_category_id' : TraitCategoryId__1,
    'created_at' : TimeStamp__1,
    'file_name' : FileName,
    'asset_url' : URL,
    'asset_id' : AssetId,
    'percentage' : Percentage,
    'launch_id' : LaunchId,
    'trait_artwork_id' : TraitArtworkId,
  });
  const TraitCategoryName = IDL.Text;
  const TraitCategoryRequest = IDL.Record({
    'trait_category_name' : TraitCategoryName,
    'index' : IDL.Int,
    'launch_id' : LaunchId,
  });
  const TraitCategoryResponse = IDL.Record({
    'updated_at' : TimeStamp__1,
    'trait_category_name' : TraitCategoryName,
    'trait_category_id' : TraitCategoryId__1,
    'created_at' : TimeStamp__1,
    'index' : IDL.Int,
    'launch_id' : LaunchId,
  });
  const LaunchId__1 = IDL.Text;
  const ArtworkId = IDL.Text;
  const TraitCategoryId = IDL.Text;
  const TraitArtworkId__1 = IDL.Text;
  const Name__2 = IDL.Text;
  const CollectionId__1 = IDL.Text;
  const GetLogMessagesFilter = IDL.Record({
    'analyzeCount' : IDL.Nat32,
    'messageRegex' : IDL.Opt(IDL.Text),
    'messageContains' : IDL.Opt(IDL.Text),
  });
  const Nanos = IDL.Nat64;
  const GetLogMessagesParameters = IDL.Record({
    'count' : IDL.Nat32,
    'filter' : IDL.Opt(GetLogMessagesFilter),
    'fromTimeNanos' : IDL.Opt(Nanos),
  });
  const GetLatestLogMessagesParameters = IDL.Record({
    'upToTimeNanos' : IDL.Opt(Nanos),
    'count' : IDL.Nat32,
    'filter' : IDL.Opt(GetLogMessagesFilter),
  });
  const CanisterLogRequest = IDL.Variant({
    'getMessagesInfo' : IDL.Null,
    'getMessages' : GetLogMessagesParameters,
    'getLatestMessages' : GetLatestLogMessagesParameters,
  });
  const CanisterLogFeature = IDL.Variant({
    'filterMessageByContains' : IDL.Null,
    'filterMessageByRegex' : IDL.Null,
  });
  const CanisterLogMessagesInfo = IDL.Record({
    'features' : IDL.Vec(IDL.Opt(CanisterLogFeature)),
    'lastTimeNanos' : IDL.Opt(Nanos),
    'count' : IDL.Nat32,
    'firstTimeNanos' : IDL.Opt(Nanos),
  });
  const LogMessagesData = IDL.Record({
    'timeNanos' : Nanos,
    'message' : IDL.Text,
  });
  const CanisterLogMessages = IDL.Record({
    'data' : IDL.Vec(LogMessagesData),
    'lastAnalyzedMessageTimeNanos' : IDL.Opt(Nanos),
  });
  const CanisterLogResponse = IDL.Variant({
    'messagesInfo' : CanisterLogMessagesInfo,
    'messages' : CanisterLogMessages,
  });
  const MetricsGranularity = IDL.Variant({
    'hourly' : IDL.Null,
    'daily' : IDL.Null,
  });
  const GetMetricsParameters = IDL.Record({
    'dateToMillis' : IDL.Nat,
    'granularity' : MetricsGranularity,
    'dateFromMillis' : IDL.Nat,
  });
  const UpdateCallsAggregatedData = IDL.Vec(IDL.Nat64);
  const CanisterHeapMemoryAggregatedData = IDL.Vec(IDL.Nat64);
  const CanisterCyclesAggregatedData = IDL.Vec(IDL.Nat64);
  const CanisterMemoryAggregatedData = IDL.Vec(IDL.Nat64);
  const HourlyMetricsData = IDL.Record({
    'updateCalls' : UpdateCallsAggregatedData,
    'canisterHeapMemorySize' : CanisterHeapMemoryAggregatedData,
    'canisterCycles' : CanisterCyclesAggregatedData,
    'canisterMemorySize' : CanisterMemoryAggregatedData,
    'timeMillis' : IDL.Int,
  });
  const NumericEntity = IDL.Record({
    'avg' : IDL.Nat64,
    'max' : IDL.Nat64,
    'min' : IDL.Nat64,
    'first' : IDL.Nat64,
    'last' : IDL.Nat64,
  });
  const DailyMetricsData = IDL.Record({
    'updateCalls' : IDL.Nat64,
    'canisterHeapMemorySize' : NumericEntity,
    'canisterCycles' : NumericEntity,
    'canisterMemorySize' : NumericEntity,
    'timeMillis' : IDL.Int,
  });
  const CanisterMetricsData = IDL.Variant({
    'hourly' : IDL.Vec(HourlyMetricsData),
    'daily' : IDL.Vec(DailyMetricsData),
  });
  const CanisterMetrics = IDL.Record({ 'data' : CanisterMetricsData });
  const ArtworkResponse = IDL.Record({
    'updated_at' : TimeStamp__1,
    'artwork_id' : ArtworkId__1,
    'created_at' : TimeStamp__1,
    'file_name' : Name,
    'number_of_mint' : NumberOfMint,
    'asset_url' : URL,
    'price' : Price,
    'asset_id' : AssetId,
    'launch_type' : IDL.Text,
  });
  const BlindSaleResponseWithPriceGroup = IDL.Record({
    'updated_at' : TimeStamp__1,
    'creator_share' : IDL.Bool,
    'created_at' : TimeStamp__1,
    'creator_share_nft_retained' : IDL.Nat,
    'blind_sale_id' : BlindSaleId__2,
    'open_market_place_after_days' : IDL.Nat,
    'price_group' : IDL.Vec(BlindSalePriceGroupResponse),
    'is_open_market_place_after_days_custom' : IDL.Bool,
    'leftovers' : IDL.Text,
    'type_of_artwork' : TypeOfArtwork,
    'launch_id' : LaunchId,
    'number_of_mints' : IDL.Nat,
  });
  const TraitArtworkResponse = IDL.Record({
    'updated_at' : TimeStamp__1,
    'trait_name' : TraitName,
    'trait_category_id' : TraitCategoryId__1,
    'created_at' : TimeStamp__1,
    'file_name' : FileName,
    'asset_url' : URL,
    'asset_id' : AssetId,
    'percentage' : Percentage,
    'launch_id' : LaunchId,
    'trait_artwork_id' : TraitArtworkId,
  });
  const TraitArtworkCategoryWiseResponse = IDL.Record({
    'updated_at' : TimeStamp__1,
    'trait_category_name' : TraitCategoryName,
    'trait_category_id' : TraitCategoryId__1,
    'created_at' : TimeStamp__1,
    'index' : IDL.Int,
    'trait_artworks' : IDL.Vec(TraitArtworkResponse),
    'launch_id' : LaunchId,
  });
  const LaunchResponseJson = IDL.Record({
    'updated_at' : TimeStamp__1,
    'is_air_drop_nft_enabled' : IDL.Bool,
    'launch_status' : IDL.Text,
    'is_zip_upload' : IDL.Bool,
    'air_drop_id_list' : IDL.Vec(AirDropId),
    'air_drop_dscvr_wallet_list' : IDL.Opt(DscvrWalletListResponse),
    'collection_id' : CollectionId,
    'artworks' : IDL.Vec(ArtworkResponse),
    'created_at' : TimeStamp__1,
    'metadata_url' : URL,
    'zip_url' : URL,
    'thumbnail_zip_url' : URL,
    'air_drop_sale' : IDL.Opt(AirDropSaleResponse),
    'launch_name' : Name,
    'launch_type' : IDL.Text,
    'blind_sale' : IDL.Opt(BlindSaleResponseWithPriceGroup),
    'launch_id' : LaunchId,
    'trait_artwork_categorywise' : IDL.Vec(TraitArtworkCategoryWiseResponse),
  });
  const LaunchResponseShort = IDL.Record({
    'creator_name' : Name,
    'creator_id' : CreatorId,
    'collection_id' : CollectionId,
    'collection_name' : Name,
    'earliest_launch_date_time' : IDL.Opt(TimeStamp__1),
    'earliest_end_sale_time' : IDL.Opt(TimeStamp__1),
    'launch_name' : Name,
    'launch_type' : IDL.Text,
    'launch_id' : LaunchId,
  });
  const URL__1 = IDL.Text;
  return IDL.Service({
    'addNewAdmin' : IDL.Func([IDL.Text, PrincipalId__1], [IDL.Bool], []),
    'addNewWhitelistUser' : IDL.Func(
        [IDL.Text, PrincipalId__1],
        [IDL.Bool],
        [],
      ),
    'collectCanisterMetrics' : IDL.Func([], [], []),
    'createAirDropSale' : IDL.Func(
        [AirDropSaleRequest],
        [IDL.Opt(AirDropSaleResponse)],
        [],
      ),
    'createArtwork' : IDL.Func(
        [ArtworkRequest],
        [IDL.Opt(ArtworkResponse__1)],
        [],
      ),
    'createArtworkBulk' : IDL.Func(
        [IDL.Vec(ArtworkRequest)],
        [IDL.Vec(IDL.Opt(ArtworkResponse__1))],
        [],
      ),
    'createBlindSale' : IDL.Func(
        [BlindSaleRequest],
        [IDL.Opt(BlindSaleResponse)],
        [],
      ),
    'createBlindSalePriceGroupBulk' : IDL.Func(
        [BlindSaleId__1, IDL.Vec(BlindSalePriceGroupRequest)],
        [IDL.Vec(IDL.Opt(BlindSalePriceGroupResponse))],
        [],
      ),
    'createCollection' : IDL.Func(
        [CollectionRequest],
        [IDL.Opt(CollectionResponse)],
        [],
      ),
    'createDscvrWalletList' : IDL.Func(
        [DscvrWalletListRequest],
        [IDL.Opt(DscvrWalletListResponse)],
        [],
      ),
    'createLaunch' : IDL.Func(
        [LaunchRequest],
        [IDL.Opt(LaunchResponse__1)],
        [],
      ),
    'createTraitArtwork' : IDL.Func(
        [TraitArtworkRequest],
        [IDL.Opt(TraitArtworkResponse__1)],
        [],
      ),
    'createTraitArtworkBulk' : IDL.Func(
        [IDL.Vec(TraitArtworkRequest)],
        [IDL.Vec(IDL.Opt(TraitArtworkResponse__1))],
        [],
      ),
    'createTraitCategory' : IDL.Func(
        [TraitCategoryRequest],
        [IDL.Opt(TraitCategoryResponse)],
        [],
      ),
    'deleteArtwork' : IDL.Func([LaunchId__1, ArtworkId], [IDL.Bool], []),
    'deleteBlindSalePriceGroup' : IDL.Func(
        [LaunchId__1, BlindSalePriceGroupId],
        [IDL.Bool],
        [],
      ),
    'deleteDscvrWalletListAirDropBylaunchId' : IDL.Func(
        [LaunchId__2],
        [IDL.Bool],
        [],
      ),
    'deleteDscvrWalletListByBlindSalePriceGroupId' : IDL.Func(
        [BlindSalePriceGroupId],
        [IDL.Bool],
        [],
      ),
    'deleteLaunch' : IDL.Func([LaunchId__1], [IDL.Bool], []),
    'deleteTraitArtwork' : IDL.Func(
        [LaunchId__1, TraitCategoryId, TraitArtworkId__1],
        [IDL.Bool],
        [],
      ),
    'deleteTraitCategory' : IDL.Func(
        [LaunchId__1, TraitCategoryId],
        [IDL.Bool],
        [],
      ),
    'getAirDropSale' : IDL.Func(
        [AirDropSaleId],
        [AirDropSaleResponse],
        ['query'],
      ),
    'getAllAdmin' : IDL.Func([IDL.Text], [IDL.Vec(PrincipalId__1)], ['query']),
    'getAllArtworks' : IDL.Func(
        [LaunchId__1],
        [IDL.Vec(ArtworkResponse__1)],
        ['query'],
      ),
    'getAllCollectionIdsGlobal' : IDL.Func(
        [],
        [
          IDL.Vec(
            IDL.Record({
              'updated_at' : TimeStamp,
              'creator_name' : Name__2,
              'collection_id' : CollectionId__1,
              'created_at' : TimeStamp,
              'collection_name' : Name__2,
              'principal_id' : PrincipalId__1,
            })
          ),
        ],
        ['query'],
      ),
    'getAllCollectionNames' : IDL.Func([], [IDL.Vec(Name__2)], ['query']),
    'getAllCollections' : IDL.Func(
        [],
        [IDL.Vec(CollectionResponse)],
        ['query'],
      ),
    'getAllCreatorNames' : IDL.Func([], [IDL.Vec(Name__2)], ['query']),
    'getAllLaunchIdsGlobal' : IDL.Func(
        [],
        [
          IDL.Vec(
            IDL.Record({
              'updated_at' : TimeStamp,
              'launch_status' : IDL.Text,
              'created_at' : TimeStamp,
              'launch_id' : LaunchId__1,
            })
          ),
        ],
        ['query'],
      ),
    'getAllLaunches' : IDL.Func(
        [CollectionId__1],
        [IDL.Vec(LaunchResponse__1)],
        ['query'],
      ),
    'getAllTraitArtworks' : IDL.Func(
        [LaunchId__1, TraitCategoryId],
        [IDL.Vec(TraitArtworkResponse__1)],
        ['query'],
      ),
    'getArtworkInformation' : IDL.Func(
        [LaunchId__1],
        [
          IDL.Record({
            'final_artworks' : IDL.Vec(ArtworkResponse__1),
            'trait_categories' : IDL.Vec(TraitCategoryResponse),
            'type_of_artwork' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'getBlindSale' : IDL.Func([BlindSaleId__1], [BlindSaleResponse], ['query']),
    'getBlindSalePriceGroupBulk' : IDL.Func(
        [BlindSaleId__1],
        [IDL.Vec(BlindSalePriceGroupResponse)],
        ['query'],
      ),
    'getCanisterLog' : IDL.Func(
        [IDL.Opt(CanisterLogRequest)],
        [IDL.Opt(CanisterLogResponse)],
        ['query'],
      ),
    'getCanisterMetrics' : IDL.Func(
        [GetMetricsParameters],
        [IDL.Opt(CanisterMetrics)],
        ['query'],
      ),
    'getCollection' : IDL.Func(
        [CollectionId__1],
        [IDL.Opt(CollectionResponse)],
        ['query'],
      ),
    'getCollectionById' : IDL.Func(
        [CollectionId__1],
        [CollectionResponse],
        ['query'],
      ),
    'getCollectionDump' : IDL.Func(
        [],
        [
          IDL.Opt(
            IDL.Vec(IDL.Tuple(PrincipalId__1, IDL.Vec(CollectionResponse)))
          ),
        ],
        ['query'],
      ),
    'getLaunchById' : IDL.Func([LaunchId__1], [LaunchResponseJson], ['query']),
    'getLaunchesByStatus' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(LaunchResponseShort)],
        [],
      ),
    'getNextLaunchAndChangeStatus' : IDL.Func([], [IDL.Opt(LaunchId__1)], []),
    'getTraitCategories' : IDL.Func(
        [LaunchId__1],
        [IDL.Vec(TraitCategoryResponse)],
        ['query'],
      ),
    'isAdminUser' : IDL.Func([], [IDL.Bool], ['query']),
    'isWhitelistedUser' : IDL.Func([], [IDL.Bool], ['query']),
    'saveZipUploadUrl' : IDL.Func(
        [LaunchId__1, IDL.Bool, URL__1],
        [IDL.Bool],
        [],
      ),
    'updateAirDropSale' : IDL.Func(
        [AirDropSaleId, AirDropSaleRequest],
        [IDL.Bool],
        [],
      ),
    'updateArtwork' : IDL.Func([ArtworkId, ArtworkRequest], [IDL.Bool], []),
    'updateBlindSale' : IDL.Func(
        [BlindSaleId__1, BlindSaleRequest],
        [IDL.Bool],
        [],
      ),
    'updateBlindSalePriceGroup' : IDL.Func(
        [BlindSalePriceGroupId, BlindSalePriceGroupRequest],
        [IDL.Bool],
        [],
      ),
    'updateCollection' : IDL.Func(
        [CollectionId__1, CollectionRequest],
        [IDL.Bool],
        [],
      ),
    'updateDscvrWalletList' : IDL.Func(
        [DscvrWalletListId, DscvrWalletListRequest],
        [IDL.Bool],
        [],
      ),
    'updateLaunch' : IDL.Func([LaunchId__1, LaunchRequest], [IDL.Bool], []),
    'updateLaunchStatus' : IDL.Func([LaunchId__1, IDL.Text], [IDL.Bool], []),
    'updateTraitArtwork' : IDL.Func(
        [ArtworkId, TraitArtworkRequest],
        [IDL.Bool],
        [],
      ),
    'updateTraitCategory' : IDL.Func(
        [TraitCategoryId, TraitCategoryRequest],
        [IDL.Bool],
        [],
      ),
    'wallet_balance' : IDL.Func([], [IDL.Nat], []),
    'wallet_receive' : IDL.Func(
        [],
        [IDL.Record({ 'accepted' : IDL.Nat64 })],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
