




const isLocal = true; // mint locally or on ic
var minterSeed = "wild destroy crystal dice brick crush fantasy swamp gain vote galaxy vendor";

// var canisterIdIC = "sduhj-uaaaa-aaaam-qa7hq-cai";
var canisterIdLocal = "rrkah-fqaaa-aaaaa-aaaaq-cai";

var basePath = "/home/velgajski1/projects/ext-v2-token/"

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
const { group } = require('console');

const Ed25519KeyIdentity = require("@dfinity/identity").Ed25519KeyIdentity;
const HttpAgent = require("@dfinity/agent").HttpAgent;
const Actor = require("@dfinity/agent").Actor;
const Principal = require("@dfinity/principal").Principal;
const V2IDL = require("./../.dfx/local/canisters/ext_v2/ext_v2.did.js").idlFactory

const mnemonicToId = (mnemonic) => {
    var seed = bip39.mnemonicToSeedSync(mnemonic);
    seed = Array.from(seed);
    seed = seed.splice(0, 32);
    seed = new Uint8Array(seed);
    return Ed25519KeyIdentity.generate(seed);
  }
  
  var id = mnemonicToId(minterSeed);
  console.log(id);

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

const setupSale = async () => {
  console.log("Setting up blind sale");  
  let path = "misc/data/"   
  let saleJson = fs.readFileSync(path+'ST.json')
  let launch = JSON.parse(saleJson);

  let nftCanister = API;

  console.log(launch);
  console.log(nftCanister.config);
  
 var groups = [];
 var pgs = launch.blind_sale[0].price_group;
 for(var i = 0; i < pgs.length; i++){
   var p = [];
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
 let collectionOwnerAddress = cleanAddress("a4a84458f9e4a7e57fd12e5d073671746d1884ea44c1780f7f942962cf63d60f");
 var lo = launch.blind_sale[0].leftovers;
 var leftovers = {send:collectionOwnerAddress};
//  if (lo == '2') {
//    leftovers = {burn:null};
//  };
//  leftovers = {retain:null};
//  console.log(groups[0].pricing)
 console.log(groups[0])

//  leftovers =  parseInt(lo);
 console.log(leftovers);
 console.log(groups);
 var so = await nftCanister.ext_saleOpen(groups, leftovers, []);
//  if (so) {
//    console.log("Sale setup!");
//  } else {
//    console.log("Sale failed to setup...");
//  };
}

convertAllToAddress = () => 
{
  whitelistNew = whitelistNew.map(a => {
    if (a.indexOf("-")>=0)
    {
      let principal = Principal.fromText(a, 0);
      let accId = extjs.default.principalToAccountIdentifier(a);
      // console.log(accId);
      return accId
    }
    return a;
    
    
  })
  // extjs.principalToAccountIdentifier()

  console.log(whitelistNew.length)
}


(async () => {
  console.log("start script")
  // convertAllToAddress();

  var i = 1000;
  var toMint = []
  while(i-- > 0)
  {
    toMint.push([
      "0000",
      {
        nonfungible : {
          name : ""+i+"_front",
          asset : "ahAsset",
          thumbnail : "ahThumb",
          metadata : []
        }
      }
    ]
    )
  }
  await API.ext_mint(toMint);

  await setupSale()

  // await API.setMinter(Principal.fromText("55rjt-fww5v-t6ktt-etpvr-wmwn2-t5eks-w365d-zwjbe-yi2ux-uapb4-hae"))

  // await API.ext_setSaleRoyalty("13ad62eb6a378a3d8ae3c8f4871b840113f98f6db85a9bddf5bb573a1673a394");
  // await API.ext_setRoyalty([("13ad62eb6a378a3d8ae3c8f4871b840113f98f6db85a9bddf5bb573a1673a394",BigInt(5000)), ("e3d45e0f1f226ec80fb345dcbaa264207cdc4781a6abd6cb57f50d562aa121db", BigInt(2500))]);
})();
