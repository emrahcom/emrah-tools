// mute-unmute-XX - created UnmuteRemoteParticipantDialog component

import React from 'react';

import { Dialog } from '../../../base/dialog';
import { translate } from '../../../base/i18n';
import { connect } from '../../../base/redux';
import AbstractUnmuteRemoteParticipantDialog
    from '../AbstractUnmuteRemoteParticipantDialog';

/**
 * A React Component with the contents for a dialog that asks for confirmation
 * from the user before muting a remote participant.
 *
 * @extends Component
 */
class UnmuteRemoteParticipantDialog extends AbstractUnmuteRemoteParticipantDialog {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <Dialog
                okKey = 'dialog.unmuteParticipantButton'
                onSubmit = { this._onSubmit }
                titleKey = 'dialog.unmuteParticipantTitle'
                width = 'small'>
                <div>
                    { this.props.t('dialog.unmuteParticipantBody') }
                </div>
            </Dialog>
        );
    }

    _onSubmit: () => boolean;
}

export default translate(connect()(UnmuteRemoteParticipantDialog));
