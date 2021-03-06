import React, { PureComponent } from 'react';
import timer from 'react-native-timer';
import PropTypes from 'prop-types';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { connect } from 'react-redux';
import BalanceComponent from 'ui/views/wallet/Balance';
import SendComponent from 'ui/views/wallet/Send';
import Receive from 'ui/views/wallet/Receive';
import History from 'ui/views/wallet/History';
import Settings from 'ui/views/wallet/Settings';

const routeToComponent = {
    balance: BalanceComponent,
    send: SendComponent,
    receive: Receive,
    history: History,
    settings: Settings,
};

class TabContent extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            nextRoute: props.currentRoute,
        };
    }

    componentWillReceiveProps(newProps) {
        if (this.props.currentRoute !== newProps.currentRoute) {
            this.animationOutType = this.getAnimation(this.props.currentRoute, newProps.currentRoute, false);
            this.animationInType = this.getAnimation(this.props.currentRoute, newProps.currentRoute);
            timer.setTimeout(
                'delayRouteChange' + newProps.currentRoute,
                () => this.setState({ nextRoute: newProps.currentRoute }),
                150,
            );
        }

        if (this.props.inactive && newProps.inactive) {
            this.animationInType = ['fadeIn'];
        }
    }

    componentWillUnmount() {
        timer.clearTimeout('delaySettingChange' + this.props.currentRoute);
    }

    /**
     * Gets settings animation according to current and next home route
     *
     * @param {string} currentHomeRoute
     * @param {string} nextHomeRoute
     * @param {bool} animationIn
     * @returns {object}
     */
    getAnimation(currentHomeRoute, nextHomeRoute, animationIn = true) {
        const routes = ['balance', 'send', 'receive', 'history', 'settings'];
        if (routes.indexOf(currentHomeRoute) < routes.indexOf(nextHomeRoute)) {
            if (animationIn) {
                return ['slideInRightSmall', 'fadeIn'];
            }
            return ['slideOutLeftSmall', 'fadeOut'];
        } else if (routes.indexOf(currentHomeRoute) > routes.indexOf(nextHomeRoute)) {
            if (animationIn) {
                return ['slideInLeftSmall', 'fadeIn'];
            }
            return ['slideOutRightSmall', 'fadeOut'];
        }
    }

    render() {
        const { isKeyboardActive } = this.props;
        const { nextRoute } = this.state;
        const Content = routeToComponent[nextRoute];

        return (
            <AnimatedComponent
                animationInType={this.animationInType}
                animationOutType={this.animationOutType}
                animateInTrigger={this.state.nextRoute}
                animateOutTrigger={this.props.currentRoute}
                duration={150}
                style={{ flex: 1 }}
            >
                <Content
                    type={nextRoute}
                    closeTopBar={() => this.props.handleCloseTopBar()}
                    isKeyboardActive={isKeyboardActive}
                    onTabSwitch={(name) => this.props.onTabSwitch(name)}
                />
            </AnimatedComponent>
        );
    }
}

const mapStateToProps = (state) => ({
    currentRoute: state.home.childRoute,
    inactive: state.ui.inactive,
    isKeyboardActive: state.ui.isKeyboardActive,
});

TabContent.propTypes = {
    /** @ignore */
    currentRoute: PropTypes.oneOf(Object.keys(routeToComponent)),
    /** onTabSwitch callback function
     * @param {string} name - Next route name
     */
    onTabSwitch: PropTypes.func.isRequired,
    /** Closes topbar */
    handleCloseTopBar: PropTypes.func.isRequired,
    /** @ignore */

    isKeyboardActive: PropTypes.bool.isRequired,
    /** @ignore */
    inactive: PropTypes.bool.isRequired,
};

TabContent.defaultProps = {
    currentRoute: 'balance',
};

export default connect(mapStateToProps, null)(TabContent);
