import atom from "./atom.mjs";
import json1 from "./json.mjs";
import rss2 from "./rss2.mjs";

class ExtraExtra {
	constructor(channel){
		ExtraExtra.checkChannelData(channel);
		this.channel = channel;
		this.items = [];
	}

	static checkChannelData(channel){
		if (channel.title && channel.id && channel.url && channel.feedUrl && channel.description) {
			// Ok, the required fields exist.
			return;
		}
		throw new Error("Could not create feed: missing one of the required fields (url, title, id, feedUrl, description).");
	}

	addItem(item){
		this.items.push(item);
	}

	rss2(){
		const channel = {
			...this.channel,
			items: this.items
		};
		return rss2(channel);
	}

	atom(){
		const channel = {
			...this.channel,
			items: this.items
		};
		return atom(channel);
	}

	json(){
		const channel = {
			...this.channel,
			items: this.items
		};
		return json1(channel);
	}
}

export default ExtraExtra;

