import { useEffect, useState } from 'react';
import { useFormContext } from '../../hooks/useFormContext';
/**
 * 案例：直接受控，visible 为true时渲染Component
 * <Interactive
 *  visible={visible}
 * >
 *  <Component />
 * </Interactive>
 *
 * 案例：显隐二
 * visibleAction = props => props.visible === 'Y'
 * <Interactive
 *  visible={visible}
 *  onChange={visibleAction}
 * >
 *  <Component />
 * </Interactive>
 *
 * 案例：显隐三，复杂显影映射
 * visibleAction = props => props.repeatable
 * <Interactive
 *  repeatable={repeatable}
 *  onChange={visibleAction}
 * >
 *  <ComponentY case="Y" />
 *  <ComponentN case="N" />
 * </Interactive>
 */
const SimpleVisible = (props) => {
    const { actions } = useFormContext();
    const { children, action: privateAction, visible = false } = props;
    if (children == null) {
        throw new Error('Children is required.');
    }
    const { name } = children.props;
    if (!privateAction && name == null) {
        throw new Error('Field name is required.');
    }
    const defaultAction = (props) => Number(visible);
    const action = privateAction || (actions === null || actions === void 0 ? void 0 : actions[name]) || defaultAction;
    const [active, setActive] = useState(action(props));
    useEffect(() => {
        setActive(action(props));
        //return () => { console.log('tttt delete');}
    }, [props.visible]);
    if (!active) {
        // console.log('simple ttttt validator', name, true);
        return null;
    }
    return children;
};
export default SimpleVisible;
