const chai = require('chai');
const expect = chai.expect;
const fetch = require('node-fetch');
const PagerDuty = require('../');

describe('PagerDuty', () => {
  describe('Constructor', () => {
    it('should set the service key', () => {
      const pager = new PagerDuty('asd');
      expect(pager._serviceKey).to.equal('asd');
    });

    it('should set the API url', () => {
      const pager = new PagerDuty(null);
      expect(pager._api.length > 0).to.be.true;
    });
  });

  describe('Get data options', () => {
    it('should contruct fetch option object', () => {
      const pager = new PagerDuty('thekey');
      const expected = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_key: 'thekey',
          event_type: 'trigger',
          incident_key: 'incident1',
          description: 'desc',
          details: {
            error: true,
          },
        }),
      };

      const real = pager._getDataOptions(
        'trigger',
        'incident1',
        'desc',
        {
          error: true,
        }
      );

      expect(real).to.deep.equal(expected);
    });

    it('should throw error on invalid action', () => {
      const pager = new PagerDuty('thekey');
      expect(() => pager._getDataOptions('invalid', null, null))
        .to.throw('Invalid action option, valid is one of acknowledge|acknowledge|resolve');
    });
  });

  describe('Extract errordata', () => {
    it('should extract message', () => {
      const pager = new PagerDuty(null);
      const actual = pager._extractErrorData(new Error('mymessage'));
      expect(actual.message).to.equal('mymessage');
    });

    it('should extract stack', () => {
      const pager = new PagerDuty(null);
      const actual = pager._extractErrorData(new Error('mymessage'));
      expect(actual.stack).to.contain('Context.it');
      expect(actual.stack.length).to.be.above(100);
    });

    it('should extract name', () => {
      const pager = new PagerDuty(null);
      const actual = pager._extractErrorData(new Error('mymessage'));
      expect(actual.name).to.equal('Error');
    });
  });
});
