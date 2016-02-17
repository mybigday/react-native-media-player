const RenderStatusList = [
	"Idle",
	"Rending",
	"RendOut"
];

const PushWayList = [
	"AtLast",
	"AfterNow",
	"Interrupt",
	"ClearOther"
];

let RENDER_STATUS = {};
RenderStatusList.forEach((renderStatus) => {
	RENDER_STATUS[renderStatus] = renderStatus;
});
let PUSH_WAY = {};
PushWayList.forEach((pushWay) => {
	PUSH_WAY[pushWay] = pushWay;
});

module.exports = {
	RENDER_STATUS: RENDER_STATUS,
	PUSH_WAY: PUSH_WAY
};