const fetch = require('node-fetch');

class PagerDuty {
  /**
   * Constructor
   * @author Johan Kanefur <johan.canefur@gmail.com>
   * @param  {string} serviceKey PagerDuty service key aka. integration key
   */
  constructor(serviceKey) {
    this._api = 'https://events.pagerduty.com' +
      '/generic/2010-04-15/create_event.json';
    this._serviceKey = serviceKey;
  }

  /**
   * Triggers an alert via the PagerDuty API
   * @author Johan Kanefur <johan.canefur@gmail.com>
   * @param  {string} incidentKey Identifies the incident to which this trigger
   *                              event should be applied. If there's no open
   *                              (i.e. unresolved) incident with this key, a
   *                              new one will be created. If there's already an
   *                              open incident with a matching key, this event
   *                              will be appended to that incident's log. The
   *                              event key provides an easy way to "de-dup"
   *                              problem reports.
   * @param  {string} description A short description of the problem that led to
   *                              this trigger. This field (or a truncated
   *                              version) will be used when generating phone
   *                              calls, SMS messages and alert emails. It will
   *                              also appear on the incidents tables in the
   *                              PagerDuty UI. The max length is 1024 chars.
   * @param  {object} details     An arbitrary JSON object containing any data
   *                              you'd like included in the incident log.
   * @return {Promise}            Resolves the incident key on success, rejects
   *                              on any errors
   */
  trigger(incidentKey, description, details = {}) {
    const options = this._getDataOptions(
      'trigger',
      incidentKey,
      description,
      details
    );

    return this._sendApiRequest(options).then(data => {
      return data.incident_key;
    });
  }

  /**
   * Acknowlegdes an incident
   * @author Johan Kanefur <johan.canefur@gmail.com>
   * @param  {string}  incidentKey The incident to acknowledge
   * @param  {string}  description Description about the acknowledge (optional)
   * @param  {object}  details     Meta data related to the ack (optional)
   * @return {Promise}             Resolving promise on success, reject on fail
   */
  acknowledge(incidentKey, description = null, details = {}) {
    const options = this._getDataOptions(
      'acknowledge',
      incidentKey,
      description,
      details
    );

    return this._sendApiRequest(options);
  }

  /**
   * Resolves an incident
   * @author Johan Kanefur <johan.canefur@gmail.com>
   * @param  {string}  incidentKey The incident to resolve
   * @param  {string}  description Description about the resolve (optional)
   * @param  {object}  details     Details about the resolve
   * @return {Promise}             Resolving promise on success, reject on fail
   */
  resolve(incidentKey, description = null, details = {}) {
    const options = this._getDataOptions(
      'resolve',
      incidentKey,
      description,
      details
    );

    return this._sendApiRequest(options);
  }

  /**
   * Sends an API request to the PagerDuty endpoint with provided data
   * @author Johan Kanefur <johan.canefur@gmail.com>
   * @param  {object} options Fetch options object
   * @return {Promise}        Rejection on error, resolveing data on success
   */
  _sendApiRequest(options) {
    return new Promise((resolve, reject) => {
      fetch(this._api, options)
      .then(res => {
        if (res.status !== 200) {
          res.text().then(data => {
            console.log(data);
          });
          throw new Error(`PagerDuty API responded with HTTP ${res.status}`);
        }

        return res.json();
      })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
    });
  }

  /**
   * Constructs the option object for fetch
   * @author Johan Kanefur <johan.canefur@gmail.com>
   * @param  {string} action      Action one of (resolve|acknowledge|trigger)
   * @param  {string} incidentKey The PagerDuty incident key
   * @param  {string} description Description of failure
   * @param  {object} details     Object with metadata related to the failure
   * @return {object}             Fetch options object
   */
  _getDataOptions(action, incidentKey, description, details = {}) {
    // Extract information from error object since they cannot be stringified
    if (details instanceof Error) {
      details = this._extractErrorData(details);
    }

    // Validate action
    if (['trigger', 'acknowledge', 'resolve'].indexOf(action) === -1) {
      throw new Error(
        'Invalid action option, valid is one of acknowledge|acknowledge|resolve'
      );
    }

    return {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_key: this._serviceKey, // eslint-disable-line
        event_type: action, // eslint-disable-line
        incident_key: incidentKey, // eslint-disable-line
        description: description,
        details: details,
      }),
    };
  }

  /**
   * Extracts data in error objects to plain object
   * @author Johan Kanefur <johan.canefur@gmail.com>
   * @param  {Error} err Error to extract data for
   * @return {object}    Plain object with error data
   */
  _extractErrorData(err) {
    const tmp = JSON.stringify(err, [
      'message',
      'arguments',
      'type',
      'name',
      'stack',
    ]);

    return JSON.parse(tmp);
  }
}

module.exports = PagerDuty;
