const RenderStatusList = [
	"Idle",
	"Rending",
	"RendOut"
];

const PushTypeList = [
	"AtLast",
	"AfterNow",
	"Interrupt",
	"ClearOther"
];

let RENDER_STATUS = {};
RenderStatusList.forEach((renderStatus) => {
	RENDER_STATUS[renderStatus] = renderStatus;
});
let PUSH_TYPE = {};
PushTypeList.forEach((pushType) => {
	PUSH_TYPE[pushType] = pushType;
});

module.exports = {
	RENDER_STATUS: RENDER_STATUS,
	PUSH_TYPE: PUSH_TYPE
};