export const RECEIVE_TIME=.9;
export const RAISED_HOLD=1.1;
export const ENDING_DURATION=RECEIVE_TIME+RAISED_HOLD;
export function endingFrame(active,time,delivered){
 const raised=delivered||(active&&time>=RECEIVE_TIME);
 return {ownerPose:raised?'raised-cap':'normal',capLayer:raised?'baked':active?'transfer':'mouth'};
}
