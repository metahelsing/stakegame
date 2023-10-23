import { SaveMission as SaveMissionEvent } from "../../testnet/generated/EldaruneStakeGame/EldaruneStakeGame";
import { StartMission as StartMissionEvent } from "../../testnet/generated/EldaruneStakeGame/EldaruneStakeGame";
import { EndMission as EndMissionEvent } from "../../testnet/generated/EldaruneStakeGame/EldaruneStakeGame";
import { Mission, MissionSubscribe, MissionSubscribeHistory, Requirement, Reward } from "../generated/schema";
import { explorerTrxUrl } from "./constants";

export function handleSaveMission(event: SaveMissionEvent): void {
  for(let i = 0; i < event.params.rewards.length; i++) {
      let missionReward = Reward.load(event.params.missionId.toString() + "-" + i.toString());
      if(!missionReward) missionReward = new Reward(event.params.missionId.toString() + "-" + i.toString());
      missionReward.tokenAddress = event.params.rewards[i].tokenAddress;
      missionReward.tokenId = event.params.rewards[i].tokenId;
      missionReward.amount = event.params.rewards[i].amount;
      missionReward.mission = event.params.missionId.toString();
      missionReward.save();
  }

  for(let i = 0; i < event.params.requirements.length; i++) {
      let missionRequirement = Requirement.load(event.params.missionId.toString() + "-" + i.toString());
      if(!missionRequirement) missionRequirement = new Requirement(event.params.missionId.toString() + "-" + i.toString());
      missionRequirement.tokenAddress = event.params.requirements[i].tokenAddress;
      missionRequirement.tokenId = event.params.requirements[i].tokenId;
      missionRequirement.amount = event.params.requirements[i].amount;
      missionRequirement.burnRate = event.params.requirements[i].burnRate;
      missionRequirement.mission = event.params.missionId.toString();
      missionRequirement.save();
  }

  let mission = Mission.load(event.params.missionId.toString());
  if(!mission) mission = new Mission(event.params.missionId.toString());
  mission.missionId = event.params.missionId;
  mission.blockCount = event.params.blockCount;
  mission.numberOfRepetitions=event.params.numberOfRepetitions;
  mission.missionUrl=event.params.missionUrl;
  mission.save();
}

export function handleStartMission(event: StartMissionEvent): void {
 let missionSubscribe = MissionSubscribe.load(event.params.walletAddress.toHexString() + "-" + event.params.subscribeId.toString());
 if(!missionSubscribe) missionSubscribe = new MissionSubscribe(event.params.subscribeId.toString());
 missionSubscribe.walletAddress = event.params.walletAddress;
 missionSubscribe.startBlock = event.block.number;
 missionSubscribe.endBlock = event.params.endBlock;
 missionSubscribe.startDate = event.block.timestamp;
 missionSubscribe.mission = event.params.missionId.toString();
 missionSubscribe.active = true;
 missionSubscribe.save();

 let mission = Mission.load(event.params.missionId.toString());
 if(mission) {
  let missionSubscribeHistory = new MissionSubscribeHistory(event.params.walletAddress.toHexString() + "-" + event.params.subscribeId.toString());
  missionSubscribeHistory.walletAddress = event.params.walletAddress;
  missionSubscribeHistory.subscribeId=event.params.subscribeId;
  missionSubscribeHistory.startBlock=event.block.number;
  missionSubscribeHistory.endBlock=event.params.endBlock;
  missionSubscribeHistory.startDate= event.block.timestamp;
  missionSubscribeHistory.missionId = event.params.missionId
  missionSubscribeHistory.blockExplorerUrl = explorerTrxUrl + event.transaction.hash.toHexString();
  missionSubscribeHistory.active=false;
  missionSubscribeHistory.save();
 }
 
}

export function handleEndMission(event: EndMissionEvent): void {
  let missionSubscribe = MissionSubscribe.load(event.params.walletAddress.toHexString() + "-" + event.params.subscribeId.toString());
  let missionSubscribeHistory = MissionSubscribeHistory.load(event.params.walletAddress.toHexString() + "-" + event.params.subscribeId.toString());
  if(missionSubscribe) {
      missionSubscribe.active = false;
      missionSubscribe.save();
  }

  if(missionSubscribeHistory) {
      missionSubscribeHistory.endDate = event.block.timestamp;
      missionSubscribeHistory.active = false;
      missionSubscribeHistory.save();
  }
}
