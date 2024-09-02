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
declare const SimpleVisible: (props: any) => any;
export default SimpleVisible;
