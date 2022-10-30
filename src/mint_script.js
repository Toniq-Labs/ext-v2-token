#!/usr/bin/env node


const isLocal = false; // mint locally or on ic
var minterSeed = "wild destroy crystal dice brick crush fantasy swamp gain vote galaxy vendor";

// minterSeed = "announce innocent energy auto extend system brass negative recycle prosper injury side";

var canisterIdIC = "s4rro-jqaaa-aaaal-qbfyq-cai";
var canisterIdLocal = "rrkah-fqaaa-aaaaa-aaaaq-cai";
var basePath = "/home/velgajski1/projects/3DGhost/"
var assetPathBase = basePath+ "data/assets/AllBatchesFiles/";
var thumbsPathBase = basePath +"data/thumbnail/3d_ghost/";

//Collection Name: 3D Ghosts
//Launch ID: 7AV2Y20P5VPNKWZN95129Q9PYW
//Collection ID: 7ASZ5MGC31H40S3K0CSAR8TCD3

const OURCOMMISSION = 1000; //1%
const royaltyOptions = [
  0,
  0,
  500,
  1000,
  1500,
  2000,
  3500,
  3000,
  3500,
  4000,
  4500,
  5000,
  5500,
  6000,
  6500,
  7000,
  7500,
  8000,
  8500,
  9000,
  9500,
  10000,
];


function createSlug(str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();
  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
  .replace(/\s+/g, '-') // collapse whitespace and replace by -
  .replace(/-+/g, '-'); // collapse dashes
  return str;
};

function textToIcps(t){
  return BigInt(Math.round(Number(t)*100000000));
};
function cleanAddress(a) {
  try { 
    return (a.indexOf("-") >= 0 ? extjs.principalToAccountIdentifier(a, 0) : a)
  } catch (e) { return ""}
};
function cleanList(wl) {
  return wl.map(a => { return cleanAddress(a) }).filter(a => a != '');
};

function saveToApi(d, cid) {
  return new Promise((resolve, reject) => {
    (async () => {
      const rawResponse = await fetch('http://us-central1-entrepot-api.cloudfunctions.net/api/collections/create/'+cid+'/password12345', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(d)
      });
      const content = await rawResponse.json();
      resolve();
    })();
  });
}



require = require('esm-wallaby')(module);
var fetch = require('node-fetch');
var fs = require('fs');
const sharp = require('sharp');
const glob = require("glob");
const extjs = require("./extjs/extjs");
const utils = require("./extjs/utils");
global.fetch = fetch;

const bip39 = require('bip39')
const mime = require('mime');
const { default: apiv2Did } = require('./apiv2.did.js');

const Ed25519KeyIdentity = require("@dfinity/identity").Ed25519KeyIdentity;
const HttpAgent = require("@dfinity/agent").HttpAgent;
const Actor = require("@dfinity/agent").Actor;
const Principal = require("@dfinity/principal").Principal;
const V2IDL = require("./v2.did.js").default;
const APIIDL = require("./apiv2.did.js").default;
const NFTFACTORY = "bn2nh-jaaaa-aaaam-qapja-cai";
const NFTFACTORY_IDL = ({ IDL }) => {
  const Factory = IDL.Service({
    'createCanister' : IDL.Func([IDL.Text, IDL.Text], [IDL.Principal], []),
  });
  return Factory;
};


const mnemonicToId = (mnemonic) => {
  var seed = bip39.mnemonicToSeedSync(mnemonic);
  seed = Array.from(seed);
  seed = seed.splice(0, 32);
  seed = new Uint8Array(seed);
  return Ed25519KeyIdentity.generate(seed);
}

// var id = mnemonicToId(minterSeed);
var id = mnemonicToId(minterSeed);
var MainAPI = Actor.createActor(APIIDL, {
  agent : new HttpAgent({
    host : "https://boundary.ic0.app/",
    identity : id
  }),
  canisterId : "zggm4-5qaaa-aaaai-qmjea-cai"
});



var API;
if (isLocal)
{
  var agent = new HttpAgent({
    host : "http://localhost:8000",
    identity : id
  });
  agent.fetchRootKey();

  API = Actor.createActor(V2IDL, {
    agent : agent,
    canisterId : canisterIdLocal // your canister id on local network
  });
}
else
{
  API = Actor.createActor(V2IDL, {
    agent : new HttpAgent({
      host : "https://boundary.ic0.app/",
      identity : id
    }),
    canisterId : canisterIdIC
  });
  
}




const CHUNKSIZE = 1900000;

//Internal -> true for thumbnails, goes directly on collection canister. If false, goes to asset canister.
// api -> canister actor
// ah -> asset handle (usually filename without extension)
// filename -> full file name (with extension)
// filepath -> full file path (including filename)

const uploadAsset = async (internal, api, ah, filename, filepath) =>{
  var data = fs.readFileSync(filepath);
  var type = mime.getType(filepath); 
  var pl = [...data];
  await api.ext_assetAdd(ah, type, filename, (internal ? {direct:[]} : {canister:{canister:"",id:0}}), pl.length);
  var numberOfChunks = Math.ceil(pl.length/CHUNKSIZE);
  var c = 0;
  var first = true;
  var total = Math.ceil(pl.length/CHUNKSIZE);
  while (pl.length > CHUNKSIZE) {
    c++;
    await api.ext_assetStream(ah, pl.splice(0, CHUNKSIZE), first);
    if (first) first = false;
  };
  await api.ext_assetStream(ah, pl, first);  
  return true;
}

var collectionLength = 5000;
var success = 1950;
const uploadAssetUntilSuccess = async (internal, api, ah, filename, filepath) => {
  try 
  {
    console.log("Try to upload: ", ah, filename, filepath);
    await uploadAsset(internal, api, ah, filename, filepath);
    console.log("success: " + (++success) + " / " + collectionLength + "(" + ( 100*success/collectionLength).toFixed(2) + " %)");
  }
  catch (e)
  {
    console.log(e)
    console.log("fail, repeat")

    uploadAssetUntilSuccess(internal, api, ah, filename, filepath)
  }
};
const removeFilenameExtension = (filename) => {
  return filename.split('.').slice(0, -1).join('.');
};

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


const renameAndOrderAllFilesInFolder = async(path, extension) => {
  var totalFiles  = 0;
  fs.readdirSync(path).forEach(file => {
    fs.rename(path + file, path + (++totalFiles)+extension, () => {});
    // console.log(path + file, path + (++totalFiles)+".mp4")
    
  });
};

const mintAll = async() => {
  const shuffleFromX = 1;
  var collLen = 5000;
  var alreadyMinted = 0;
  var i = -1 + alreadyMinted;
  var toMint = [];

  await uploadAsset(true, API, "reveal", "reveal.mp4", assetPathBase + "reveal.mp4" );
  await uploadAsset(true, API, "revealThumb", "reveal.gif", thumbsPathBase + "reveal.gif" );
  // return

  // console.log("reveal added")

  while (++i < collLen)
  {
    var idx = i+1;
    var idxThumb = i+2;
    var filename = "" + idx + ".mp4";
    var filenameThumb = "" + idxThumb + ".gif";
    var ahAsset = removeFilenameExtension(filename);
    var ahThumb = ahAsset+"_thumbnail";
    var asset = assetPathBase+filename;
    var thumb = thumbsPathBase + removeFilenameExtension(filenameThumb) + ".gif";

    // await uploadAsset(true, API, ahThumb, filename, thumb)  // upload thumbnail
    
    console.log(i, ahThumb, filenameThumb, thumb);
    // if (i%5==4)
    // {
    //   await uploadAssetUntilSuccess(false, API, ahAsset, filename, asset); // upload image
    // }
    // else
    // {
    //   uploadAssetUntilSuccess(false, API, ahAsset, filename, asset); // upload image
    // }    
    
    // if (i%20==19)
    // {
    //   await uploadAssetUntilSuccess(false, API, ahThumb, filenameThumb, thumb); // upload image
    // }
    // else
    // {
    //   uploadAssetUntilSuccess(false, API, ahThumb, filenameThumb, thumb); // upload image
    // }
    


    // add asset handlers to toMint array
    toMint.push([
      "0000",
      {
        nonfungible : {
          name : ""+i+"",
          asset : ahAsset,
          thumbnail : ahThumb,
          prerevealAsset : "reveal",
          prerevealThumb : "revealThumb",
          metadata : []
        }
      }
    ])


  }

  let nonShuffle = toMint.slice(0, shuffleFromX);
  let toShuffle = toMint.slice(shuffleFromX);
  let finalToMint = nonShuffle.concat(shuffle(toShuffle));

  // mint in the end
  console.log(toMint[0]);
  console.log(toMint[4999]);
  await API.ext_mint(finalToMint);
}

const addLaunch = async () => {
  var launchId = "7AV2Y20P5VPNKWZN95129Q9PYW"
  var launch = await MainAPI.getLaunchById(launchId);
  var collection = (await MainAPI.getCollection(launch.collection_id))[0];
  console.log(launch)
  var setRoyalty = OURCOMMISSION+royaltyOptions[collection.creator_royalty];

  var APIDATA = {
    avatar : collection.images.avatar_url,
    banner : collection.images.collection_banner_url,
    collection : collection.images.collection_page_image_url,
    name : collection.collection_name,
    blurb : collection.collection_description,
    brief : collection.collection_tiny_description,
    description : collection.collection_brief_description,
    keywords : collection.keywords,
    web : collection.website_url,
    route : createSlug(collection.collection_name),
    discord : collection.social_links.discord,
    telegram : collection.social_links.telegram,
    twitter : collection.social_links.twitter,
    distrikt : collection.social_links.distrikt,
    commission : setRoyalty/100000,//launch.creator_royalty,
    filter : false,
    nftv : false,
    external : false,
    mature : false,
    priority : 10,
    market : true,
    sale : true,
    dev : true,
    earn : false,
    saletype : "v2",
    standard : "ext",
    unit : "NFT",
    legacy : "",
  };          

  // let r = await  saveToApi(APIDATA, canisterIdIC);	
  // console.log(r)
  console.log("success")

  return;
}

const addSale = async() => {
  var launchId = "7AV2Y20P5VPNKWZN95129Q9PYW"
  var launch = await MainAPI.getLaunchById(launchId);
  var collection = await MainAPI.getCollectionById(launch.collection_id);

  console.log(launch);
  console.log(collection);
  console.log("_____________________");

  var groups = [];
  var pgs = launch.blind_sale[0].price_group;
  for(var i = 0; i < pgs.length; i++){
    var p = [];
    console.log(pgs[i])
    if (pgs[i].is_bulk_pricing) {
      p = pgs[i].bulk_pricing[0].options.map(a => {
        return [BigInt(a.quantity), textToIcps(a.price)];
      });
    } else {
      p.push([1, textToIcps(pgs[i].price)]);
    };
    groups.push(
      {
        name : pgs[i].blind_sale_price_group_name,
        limit : [BigInt(pgs[i].individual_wallet_limit), BigInt(pgs[i].group_limit)],
        start : parseInt(pgs[i].launch_date_time),
        end : parseInt(pgs[i].end_sale_time),
        pricing : p,
        participants : (pgs[i].wallet_addresses.length ? cleanList(pgs[i].wallet_addresses[0]) : [])
      }
    );
  };
  let nft_receive_address = cleanAddress(collection.nft_receive_address);
  let royalty_receive_address = cleanAddress(collection.royalty_receive_address);
  // console.log(collectionOwnerAddress);
  var lo = launch.blind_sale[0].leftovers;
  var leftovers = {send:nft_receive_address};
 //  if (lo == '2') {
 //    leftovers = {burn:null};
 //  };
 //  leftovers = {retain:null};
 //  console.log(groups[0].pricing)
  console.log(groups[0])
 
 //  leftovers =  parseInt(lo);
  console.log(leftovers);
  console.log(groups);

  var setRoyalty = OURCOMMISSION+royaltyOptions[collection.creator_royalty];
  let royalty = [royalty_receive_address, BigInt(setRoyalty)]
  // await API.ext_setRoyalty([royalty]);
  // await API.ext_setSaleRoyalty(royalty_receive_address);
  var so = await API.ext_saleOpen(groups, leftovers, []);
   if (so) {
   console.log("Sale setup!");
 } else {
   console.log("Sale failed to setup...");
 };
}

(async () => {  

  // await addLaunch()
  // renameAndOrderAllFilesInFolder(thumbsPathBase, ".gif")
  // await mintAll();
  await addSale();
  console.log("script done");
})();

    
    
