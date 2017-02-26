const getAccurateDate = (date, accuracy) => {
	switch (accuracy) {
		case "date":
			return new Date(date.getFullYear(), date.getMonth(), date.getDate());
		case "month":
			return new Date(date.getFullYear(), date.getMonth());
		case "year":
			return new Date(date.getFullYear());
		case "time":
		default:
			return date;
	}
};

/* eslint-disable new-cap  */
export const dateLine = props => {
	const format = props.format ? props.format : { weekday: "long", month: "long", year: "numeric", day: "numeric" };
	const accuracy = props.accuracy ? props.accuracy : "time";

	const date = getAccurateDate(props.date, accuracy);
	return `<time class="dateline" datetime="${date.toISOString()}">
		${Intl.DateTimeFormat("en-US", format).format(date)}
	</time>`;
};
/* eslint-enable new-cap  */

export default dateLine;
