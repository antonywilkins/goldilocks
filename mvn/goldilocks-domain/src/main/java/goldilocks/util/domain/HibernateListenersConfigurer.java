package goldilocks.util.domain;

import java.util.ArrayList;
import java.util.List;

import javax.annotation.PostConstruct;
import javax.persistence.EntityManagerFactory;

import org.hibernate.cfg.beanvalidation.BeanValidationEventListener;
import org.hibernate.cfg.beanvalidation.DuplicationStrategyImpl;
import org.hibernate.event.service.spi.DuplicationStrategy;
import org.hibernate.event.service.spi.EventListenerGroup;
import org.hibernate.event.service.spi.EventListenerRegistry;
import org.hibernate.event.spi.EventType;
import org.hibernate.event.spi.PreInsertEventListener;
import org.hibernate.event.spi.PreUpdateEventListener;
import org.hibernate.internal.SessionFactoryImpl;
import org.hibernate.jpa.HibernateEntityManagerFactory;
import org.hibernate.jpa.event.internal.core.HibernateEntityManagerEventListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import goldilocks.util.domain.DomainConfig.BeanValidationEventListenerExtension;

@Component
public class HibernateListenersConfigurer {
	private static class ClassDuplicationStrategy implements DuplicationStrategy {

		private static ClassDuplicationStrategy INSTANCE = new ClassDuplicationStrategy();

		@Override
		public boolean areMatch(Object listener, Object original) {
			return listener.getClass().equals(original.getClass());
		}

		@Override
		public Action getAction() {
			return Action.ERROR;
		}
	}

	private static class JPADuplicationStrategy implements DuplicationStrategy {
		private static JPADuplicationStrategy INSTANCE = new JPADuplicationStrategy();

		@Override
		public boolean areMatch(Object listener, Object original) {
			return listener.getClass().equals(original.getClass())
					&& HibernateEntityManagerEventListener.class.isInstance(original);
		}

		@Override
		public Action getAction() {
			return Action.KEEP_ORIGINAL;
		}
	}

	private static <T> void prepare(EventListenerGroup<T> group, T listener) {
		List<T> listeners = new ArrayList<>();
		for (T l : group.listeners()) {
			listeners.add(l);
		}

		group.clear();
		for (T l : listeners) {
			if (l instanceof BeanValidationEventListener) {
				group.appendListener(listener);
			} else {
				group.appendListener(l);
			}
		}

		group.addDuplicationStrategy(ClassDuplicationStrategy.INSTANCE);
		group.addDuplicationStrategy(DuplicationStrategyImpl.INSTANCE);
		group.addDuplicationStrategy(JPADuplicationStrategy.INSTANCE);
	}

	@Autowired
	private EntityManagerFactory entityManagerFactory;

	@Autowired
	private BeanValidationEventListenerExtension listener;

	@PostConstruct
	public void registerListeners() {
		HibernateEntityManagerFactory hibernateEntityManagerFactory = (HibernateEntityManagerFactory) this.entityManagerFactory;
		SessionFactoryImpl sessionFactoryImpl = (SessionFactoryImpl) hibernateEntityManagerFactory.getSessionFactory();
		EventListenerRegistry registry = sessionFactoryImpl.getServiceRegistry()
				.getService(EventListenerRegistry.class);

		EventListenerGroup<PreInsertEventListener> preInsertGroup = registry
				.getEventListenerGroup(EventType.PRE_INSERT);
		prepare(preInsertGroup, listener);

		EventListenerGroup<PreUpdateEventListener> preUpdateGroup = registry
				.getEventListenerGroup(EventType.PRE_UPDATE);
		prepare(preUpdateGroup, listener);
	}
}
