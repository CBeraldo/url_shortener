import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session'
import { URLs, URLsGrouped } from '../collections/URLsCollection'

Meteor.startup(() => {
    if (Meteor.isServer) {
        // publicando dados para os clients.
        Meteor.publish('ultimas_urls', function() {
            var data = URLs.find({}, { sort: { createdAt: -1 }, limit: 10 });
            return data
        })
        Meteor.publish('urls_mais_encurtadas', function() {
            var data = URLsGrouped.find({}, { sort: { total: -1 } })
            return data
        })

        // métodos disponíveis.
        Meteor.methods({
            inserirURL(url) {
                var _id = URLs.insert({ url: url, createdAt: new Date() });
                var groups = URLsGrouped.find({ _id: url }).fetch().length;
                var novaUrlGroup = { _id: url, total: URLs.find({ url: url }).fetch().length + 1 };

                if (groups > 0) {
                    URLsGrouped.update(url, novaUrlGroup);
                } else {
                    URLsGrouped.insert(novaUrlGroup);
                }

                return _id
            }
        })

        // redirecionar para as urls encurtadas.
        Router.route('/:_id', {
            where: 'server',
            action: function(params) {
                var params = this.params;
                var _id = params._id;
                var redirectTo = URLs.findOne({ _id: _id })
                if (!redirectTo) {
                    this.response.writeHead(302, { 'Location': '/' });
                } else {
                    this.response.writeHead(302, { 'Location': redirectTo.url });
                }
                this.response.end();
            }
        })
    }
});